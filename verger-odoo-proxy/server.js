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

const ACTIVATION_PRODUCT_ID = 321; // ton vrai ID
const PROGRAM_ID = 2;

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
  if (!data.result) {
    console.warn(`⚠️ odooCall ${model}.${method} returned undefined`, data);
  }
  return data.result;
}

/* ====== ROUTES ====== */

// Récupérer produits
app.get("/products", async (req, res) => {
  await odooLogin();
  const products = await odooCall(
    "product.product",
    "search_read",
    [[["sale_ok", "=", true]]],
    { fields: ["id", "name", "categ_id", "list_price"] },
  );

  const formatted = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.categ_id ? p.categ_id[1] : "",
    price: p.list_price,
  }));

  res.json(formatted);
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

  try {
    await odooLogin();

    const existingCustomers = await odooCall(
      "res.partner",
      "search_read",
      [[["email", "=", email]]],
      { fields: ["id", "name", "email", "phone"] },
    );

    let customerId;

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
    } else {
      const created = await odooCall("res.partner", "create", [
        { name, email, phone, customer_rank: 1 },
      ]);

      if (typeof created === "number") {
        customerId = created;
      } else if (Array.isArray(created) && created.length > 0) {
        customerId = created[0];
      } else if (created && typeof created === "object" && "id" in created) {
        customerId = created.id;
      } else {
        return res.status(500).json({ error: "Impossible de créer le client" });
      }
    }

    res.json({ customerId });
  } catch (err) {
    console.error("❌ Erreur dans /customer-or-create :", err);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la création du client" });
  }
});

// Créer commande panier
// Créer commande panier
app.post("/order", async (req, res) => {
  const { customerId, basketId, pickupPoint, products } = req.body;

  if (!customerId)
    return res.status(400).json({ error: "customerId manquant" });

  try {
    await odooLogin();
    console.log("🟢 Création de la commande pour customerId:", customerId);

    let orderLines = [];
    let totalOrder = 0;

    // === 1️⃣ Produits personnalisés ===
    if (products && products.length > 0) {
      orderLines = products.map((p) => [
        0,
        0,
        {
          product_id: p.id,
          product_uom_qty: p.quantity,
          price_unit: p.price,
        },
      ]);

      totalOrder = orderLines.reduce(
        (sum, line) => sum + line[2].price_unit * line[2].product_uom_qty,
        0,
      );
    }
    // === 2️⃣ Panier préfabriqué / BOM ===
    else if (basketId && basketId > 0) {
      console.log("📦 Panier préfabriqué (KIT) ID:", basketId);

      const basket = await odooCall("product.template", "read", [
        [basketId],
        ["list_price", "product_variant_id"],
      ]);

      if (!basket?.length)
        return res.status(400).json({ error: "Panier introuvable" });

      const variantId = basket[0].product_variant_id[0];

      orderLines = [
        [
          0,
          0,
          {
            product_id: variantId,
            product_uom_qty: 1,
            price_unit: basket[0].list_price,
          },
        ],
      ];

      totalOrder = basket[0].list_price;
    } else {
      return res
        .status(400)
        .json({ error: "Aucun panier ni produits fournis" });
    }

    console.log("📝 Lignes de commande finales :", orderLines);
    console.log("💰 Total calculé :", totalOrder);

    // === 3️⃣ Vérifier et mettre à jour la carte fidélité ===
    const existingCard = await odooCall(
      "loyalty.card",
      "search_read",
      [
        [
          ["program_id", "=", PROGRAM_ID],
          ["partner_id", "=", customerId],
        ],
      ],
      { fields: ["id", "points"] },
    );

    if (existingCard.length > 0) {
      const cardId = existingCard[0].id;
      const oldPoints = existingCard[0].points || 0;
      await odooCall("loyalty.card", "write", [
        [cardId],
        { points: oldPoints + totalOrder },
      ]);
      console.log(
        `⭐ Points fidélité mis à jour : ${oldPoints} -> ${oldPoints + totalOrder}`,
      );
    } else {
      console.log("⚠️ Client n'a pas de carte fidélité, aucun point ajouté");
    }

    // === 4️⃣ Créer la commande ===
    const orderId = await odooCall("sale.order", "create", [
      {
        partner_id: customerId,
        note: `Point de retrait: ${pickupPoint}`,
        order_line: orderLines,
      },
    ]);
    console.log("📝 Commande créée avec ID:", orderId);

    await odooCall("sale.order", "action_confirm", [[orderId]]);
    console.log("✅ Commande confirmée");

    // === 5️⃣ Envoyer email ===
    const TEMPLATE_ID = 46;
    await odooCall("mail.template", "send_mail", [TEMPLATE_ID, orderId, true]);
    console.log("✉️ Email envoyé avec template ID:", TEMPLATE_ID);

    // === 6️⃣ Valider les pickings ===
    const orderData = await odooCall("sale.order", "read", [
      Array.isArray(orderId) ? orderId : [orderId],
      ["picking_ids"],
    ]);
    const pickingIds = orderData[0]?.picking_ids || [];
    for (const pickingId of pickingIds) {
      try {
        await odooCall("stock.picking", "action_assign", [[pickingId]]);
        await odooCall("stock.picking", "button_validate", [[pickingId]]);
        console.log("✅ Picking validé:", pickingId);
      } catch (err) {
        console.error(`❌ Erreur validation picking ${pickingId}:`, err);
      }
    }

    res.json({
      orderId,
      pointsAdded: existingCard.length > 0 ? totalOrder : 0,
    });
  } catch (err) {
    console.error("❌ Erreur /order :", err);
    res.status(500).json({
      error: "Impossible de créer la commande",
      details: err.message || err,
    });
  }
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
  } catch (err) {
    console.error("Erreur récupération paniers:", err);
    res.status(500).json({ error: "Impossible de récupérer les paniers" });
  }
});

// Inscription programme fidélité
app.post("/loyalty/register", async (req, res) => {
  const { name, email, phone, rgpdConsent } = req.body;

  try {
    await odooLogin();

    const program = await odooCall("loyalty.program", "read", [[PROGRAM_ID]], {
      fields: ["name"],
    });
    if (!program?.length)
      return res.status(404).json({ error: "Programme fidélité introuvable" });

    const existingCustomers = await odooCall(
      "res.partner",
      "search_read",
      [[["email", "=", email]]],
      { fields: ["id", "name"] },
    );
    let customerId = existingCustomers.length
      ? existingCustomers[0].id
      : await odooCall("res.partner", "create", [
          { name, email, phone, customer_rank: 1 },
        ]);

    const existingCard = await odooCall(
      "loyalty.card",
      "search_read",
      [
        [
          ["program_id", "=", PROGRAM_ID],
          ["partner_id", "=", customerId],
        ],
      ],
      { fields: ["id", "points"] },
    );
    let cardId, points;

    if (!existingCard.length) {
      cardId = await odooCall("loyalty.card", "create", [
        { program_id: PROGRAM_ID, partner_id: customerId, points: 10 },
      ]);
      points = 10;
    } else {
      cardId = existingCard[0].id;
      points = existingCard[0].points;
    }

    res.json({
      success: true,
      customerId,
      cardId,
      program,
      points,
      message: "Client inscrit au programme fidélité avec succès",
    });
  } catch (err) {
    console.error("Erreur /loyalty/register :", err);
    res.status(500).json({
      error: "Impossible de vérifier ou inscrire le client au programme",
      details: err.message || err,
    });
  }
});

app.post("/subscribe-discovery-basket", async (req, res) => {
  const { customerId, pickupPoint } = req.body;

  await odooLogin();

  // ID du produit abonnement
  const SUB_PRODUCT_ID = 555; // Panier Découverte Abonnement

  const subscriptionId = await odooCall("sale.subscription", "create", [
    {
      partner_id: customerId,
      template_id: 1, // ton modèle "Panier Découverte Hebdo"
      recurring_invoice_line_ids: [
        [
          0,
          0,
          {
            product_id: SUB_PRODUCT_ID,
            quantity: 1,
            price_unit: 12.99,
          },
        ],
      ],
      note: `Point de retrait: ${pickupPoint}`,
    },
  ]);

  await odooCall("sale.subscription", "action_confirm", [[subscriptionId]]);

  res.json({ subscriptionId });
});

app.listen(3001, () =>
  console.log("🚀 Odoo Proxy running on http://localhost:3001"),
);
