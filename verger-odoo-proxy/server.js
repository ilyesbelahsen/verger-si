const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

/* ====== CONFIG ODOO ====== */
const ODOO_URL = "https://le-verger-du-coin3.odoo.com";
const ODOO_DB = "le-verger-du-coin3";
const ODOO_LOGIN = "belahsenilyes212@gmail.com";
const ODOO_PASSWORD = "ILYESdu12?";

/* ====== SESSION ====== */
let cookies = "";

async function odooLogin() {
  const res = await fetch(`${ODOO_URL}/web/session/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        db: ODOO_DB,
        login: ODOO_LOGIN,
        password: ODOO_PASSWORD,
      },
    }),
  });

  cookies = res.headers.get("set-cookie");
  console.log("✅ Logged into Odoo");
}

async function odooCall(model, method, args = [], kwargs = {}) {
  const res = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: { model, method, args, kwargs },
    }),
  });

  const data = await res.json();
  return data.result;
}

/* ====== ROUTES ====== */

// Récupérer produits
app.get("/products", async (req, res) => {
  await odooLogin();
  const products = await odooCall("product.template", "search_read", [
    [["sale_ok", "=", true]],
  ]);
  res.json(products);
});

// Créer client
app.post("/customer", async (req, res) => {
  await odooLogin();
  const id = await odooCall("res.partner", "create", [
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      customer_rank: 1,
    },
  ]);
  res.json({ customerId: id });
});

// Créer ou récupérer un client
app.post("/customer-or-create", async (req, res) => {
  const { name, email, phone, rgpdConsent } = req.body;
  await odooLogin();

  const existingCustomers = await odooCall("res.partner", "search_read", [
    [["email", "=", email]],
    ["id", "name", "email", "phone"],
  ]);

  let customerId;
  if (existingCustomers.length > 0) {
    customerId = existingCustomers[0].id;
  } else {
    customerId = await odooCall("res.partner", "create", [
      {
        name,
        email,
        phone,
        customer_rank: 1,
        x_rgpd_consent: rgpdConsent,
      },
    ]);
  }

  res.json({ customerId });
});

// Créer commande panier
app.post("/order", async (req, res) => {
  const { customerId, basketId, pickupPoint, products } = req.body;
  console.log("\n🔵 === DÉBUT CRÉATION COMMANDE ===");
  console.log("📦 Données reçues:", {
    customerId,
    basketId,
    pickupPoint,
    products,
  });

  await odooLogin();

  let orderLines = [];

  // Produits personnalisés
  if (products && products.length > 0) {
    console.log("🛒 Mode: Produits personnalisés");
    orderLines = products.map((p) => {
      console.log(
        `  - Produit ID ${p.id}: ${p.quantity} unité(s) à ${p.price}€`,
      );
      return [
        0,
        0,
        { product_id: p.id, product_uom_qty: p.quantity, price_unit: p.price },
      ];
    });
  }
  // Panier avec BOM (ID > 0)
  else if (basketId && basketId > 0) {
    console.log("🛒 Mode: Panier avec BOM, ID:", basketId);

    const basket = await odooCall("product.template", "read", [
      [basketId],
      ["bom_ids", "list_price"],
    ]);
    if (!basket || basket.length === 0) {
      return res.status(400).json({ error: "Panier introuvable" });
    }

    if (!basket[0].bom_ids?.length) {
      return res.status(400).json({ error: "Panier sans BOM" });
    }

    const bom = await odooCall("mrp.bom", "read", [
      basket[0].bom_ids,
      ["bom_line_ids"],
    ]);
    if (!bom?.length || !bom[0].bom_line_ids?.length) {
      return res.status(400).json({ error: "Nomenclature introuvable" });
    }

    const bomLines = await odooCall("mrp.bom.line", "read", [
      bom[0].bom_line_ids,
      ["product_id", "product_qty"],
    ]);
    const productIds = bomLines.map((l) => l.product_id[0]);
    const productsData = await odooCall(
      "product.product",
      "search_read",
      [[["id", "in", productIds]]],
      { fields: ["id", "list_price"] },
    );

    orderLines = bomLines.map((line) => {
      const productData = productsData.find((p) => p.id === line.product_id[0]);
      return [
        0,
        0,
        {
          product_id: line.product_id[0],
          product_uom_qty: line.product_qty,
          price_unit: productData ? productData.list_price : 0,
        },
      ];
    });
  } else {
    return res.status(400).json({ error: "Aucun panier ni produits fournis" });
  }

  console.log(
    "\n📄 Lignes de commande finales:",
    JSON.stringify(orderLines, null, 2),
  );

  // Créer la commande
  const orderId = await odooCall("sale.order", "create", [
    {
      partner_id: customerId,
      note: `Point de retrait: ${pickupPoint}`,
      order_line: orderLines,
    },
  ]);
  console.log("✅ Commande créée, ID:", orderId);

  // Confirmer la commande
  await odooCall("sale.order", "action_confirm", [[orderId]]);
  console.log("✅ Commande confirmée");

  // Récupérer pickings
  const order = await odooCall("sale.order", "read", [
    [orderId],
    ["picking_ids"],
  ]);
  if (!order?.[0])
    return res.status(500).json({ error: "Commande introuvable" });

  const pickingIds = order[0].picking_ids || [];
  console.log("📦 Picking IDs trouvés:", pickingIds);

  for (const pickingId of pickingIds) {
    try {
      console.log(`\n🔍 === Traitement Picking ${pickingId} ===`);
      const pickingBefore = await odooCall("stock.picking", "read", [
        [pickingId],
        [
          "name",
          "state",
          "move_ids_without_package",
          "location_id",
          "location_dest_id",
        ],
      ]);
      console.log("📋 Picking AVANT validation:", pickingBefore[0]);

      if (pickingBefore[0].move_ids_without_package?.length) {
        const moves = await odooCall("stock.move", "read", [
          pickingBefore[0].move_ids_without_package,
          ["product_id", "product_uom_qty", "state"],
        ]);
        console.log("📦 Mouvements de stock:", moves);
      }

      await odooCall("stock.picking", "action_assign", [[pickingId]]);
      console.log("✅ action_assign terminé");

      const validateResult = await odooCall(
        "stock.picking",
        "button_validate",
        [[pickingId]],
      );
      console.log("✅ button_validate retour:", validateResult);
    } catch (err) {
      console.error(`❌ Erreur validation picking ${pickingId}:`, err);
    }
  }

  res.json({ orderId });
});

// Créer abonnement
app.post("/subscription", async (req, res) => {
  await odooLogin();
  const subId = await odooCall("sale.subscription", "create", [
    {
      partner_id: req.body.customerId,
      name: `Abonnement panier ${req.body.basketType}`,
      recurring_rule_count: 4,
    },
  ]);
  res.json({ subscriptionId: subId });
});

// Récupérer paniers avec produits
app.get("/baskets-with-products", async (req, res) => {
  try {
    await odooLogin();

    const basketsTemplates = await odooCall("product.template", "search_read", [
      [["is_kits", "=", true]],
      ["id", "name", "list_price", "bom_ids", "image_1920"],
    ]);

    const finalBaskets = [];

    for (const basket of basketsTemplates) {
      if (!basket.bom_ids?.length) continue;

      const bom = await odooCall("mrp.bom", "read", [
        basket.bom_ids,
        ["bom_line_ids"],
      ]);
      if (!bom?.length || !bom[0].bom_line_ids?.length) continue;

      const bomLines = await odooCall("mrp.bom.line", "read", [
        bom[0].bom_line_ids,
        ["product_id", "product_qty"],
      ]);
      if (!bomLines?.length) continue;

      const productIds = bomLines.map((l) => l.product_id[0]);
      const productsData = await odooCall(
        "product.product",
        "search_read",
        [[["id", "in", productIds]]],
        { fields: ["id", "name", "categ_id"] },
      );

      const products = bomLines
        .map((line) => {
          const p = productsData.find((prod) => prod.id === line.product_id[0]);
          if (!p) return null;
          return {
            id: p.id,
            name: p.name,
            category: p.categ_id ? p.categ_id[1] : "",
            quantity: line.product_qty,
          };
        })
        .filter(Boolean);

      finalBaskets.push({
        id: basket.id,
        name: basket.name,
        price: basket.list_price,
        image: basket.image_1920
          ? `data:image/png;base64,${basket.image_1920}`
          : undefined,
        products,
      });
    }

    res.json(finalBaskets);
  } catch (error) {
    console.error("Erreur récupération paniers:", error);
    res.status(500).json({ error: "Impossible de récupérer les paniers" });
  }
});

app.listen(3001, () =>
  console.log("🚀 Odoo Proxy running on http://localhost:3001"),
);
