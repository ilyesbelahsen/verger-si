import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MapPin,
  ShoppingBasket,
  Apple,
  Carrot,
  User,
  Mail,
  Phone,
  CalendarCheck,
  Loader2,
  Check,
} from "lucide-react";
import {
  createCustomer,
  createOrder,
  createSubscription,
  getAllBasketsWithProducts,
  Basket,
  Product,
  BasketProduct,
  getWeeklyProducts,
  getOrCreateCustomer,
  OrderProduct,
} from "@/services/odooService";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

import basketFruits from "@/assets/basket-fruits.jpg";
import basketVegetables from "@/assets/basket-vegetables.jpg";
import basketMixed from "@/assets/basket-mixed.jpg";

function buildOdooBasketName(pickupPoint: string, basketType: string): string {
  const typeLabel =
    basketType === "legumes"
      ? "Panier légumes"
      : basketType === "fruits"
        ? "Panier fruits"
        : "Panier mixte";

  const pickupLabel =
    pickupPoint === "ferme"
      ? "ferme"
      : pickupPoint === "marche-samedi"
        ? "marché samedi"
        : "marché dimanche";

  return `${typeLabel} ${pickupLabel}`;
}

// Schema de validation
const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
  email: z
    .string()
    .trim()
    .email("Adresse email invalide")
    .max(255, "L'email est trop long"),
  phone: z
    .string()
    .trim()
    .min(10, "Numéro de téléphone invalide")
    .max(20, "Numéro trop long"),
  rgpdConsent: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions RGPD" }),
  }),
});

const pickupPoints = [
  {
    id: "ferme",
    name: "Retrait à la ferme",
    description: "Du mardi au samedi, 9h-18h",
  },
  {
    id: "marche-samedi",
    name: "Marché du samedi",
    description: "Place centrale, Ville X, 8h-13h",
  },
  {
    id: "marche-dimanche",
    name: "Marché du dimanche",
    description: "Halle couverte, Ville Y, 8h-13h",
  },
];

const basketsUI = [
  {
    id: "fruits",
    name: "Panier Fruits",
    image: basketFruits,
  },
  {
    id: "legumes",
    name: "Panier Légumes",
    image: basketVegetables,
  },
  {
    id: "mixte",
    name: "Panier Mixte",
    image: basketMixed,
  },
  {
    id: "personnalise",
    name: "Panier Personnalisé",
    image: basketMixed,
  },
];

export default function Commander() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [weeklyProducts, setWeeklyProducts] = useState<BasketProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Form state
  const [pickupPoint, setPickupPoint] = useState("");
  const [basketType, setBasketType] = useState("");
  const [isSubscription, setIsSubscription] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    rgpdConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [baskets, setBaskets] = useState<Basket[]>([]);

  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(null);

  const [customProductsSelected, setCustomProductsSelected] = useState<
    Record<number, boolean>
  >({});

  const [customProductQuantities, setCustomProductQuantities] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    if (!pickupPoint || !basketType || baskets.length === 0) return;

    const odooName = buildOdooBasketName(pickupPoint, basketType);

    const found = baskets.find((b) => b.name === odooName);

    setSelectedBasket(found || null);
  }, [pickupPoint, basketType, baskets]);

  const [loadingBaskets, setLoadingBaskets] = useState(true);

  useEffect(() => {
    if (basketType !== "personnalise") return;

    async function loadWeeklyProducts() {
      setLoadingProducts(true);
      try {
        const products = await getWeeklyProducts();
        // Convertir en BasketProduct
        const basketProducts: BasketProduct[] = products.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          quantity: 1, // par défaut 1
          price: p.price,
        }));
        setWeeklyProducts(basketProducts);
        setSelectedBasket({
          id: 0, // panier "fictif" pour personnalisé
          name: "Panier Personnalisé",
          price: 0,
          products: basketProducts,
        });
      } catch (error) {
        console.error("Erreur chargement produits personnalisés:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les produits personnalisés",
          variant: "destructive",
        });
      } finally {
        setLoadingProducts(false);
      }
    }

    loadWeeklyProducts();
  }, [basketType, toast]);

  useEffect(() => {
    async function loadBaskets() {
      try {
        const allBaskets = await getAllBasketsWithProducts();
        setBaskets(allBaskets);
      } catch (error) {
        console.error("Erreur chargement paniers:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les paniers",
          variant: "destructive",
        });
      } finally {
        setLoadingBaskets(false);
      }
    }
    loadBaskets();
  }, [toast]);

  const totalPrice =
    basketType === "personnalise"
      ? selectedBasket?.products
          .filter((p) => customProductsSelected[p.id])
          .reduce(
            (sum, p) => sum + (p.price || 2) * customProductQuantities[p.id],
            0,
          ) * (isSubscription ? 4 : 1)
      : (selectedBasket?.price || 0) * (isSubscription ? 4 : 1);

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1 && !pickupPoint) {
      toast({
        title: "Point de retrait requis",
        description: "Veuillez sélectionner un point de retrait",
        variant: "destructive",
      });
      return false;
    }
    if (currentStep === 2 && !basketType) {
      toast({
        title: "Panier requis",
        description: "Veuillez sélectionner un type de panier",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation avec Zod
    const validation = customerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Créer ou récupérer le client
      const customerResult = await getOrCreateCustomer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        rgpdConsent: formData.rgpdConsent,
      });

      // 2️⃣ Déterminer les produits sélectionnés si panier personnalisé
      // Déterminer les produits sélectionnés si panier personnalisé
      const selectedProductsForOrder: OrderProduct[] | undefined =
        basketType === "personnalise"
          ? selectedBasket?.products
              .filter((p) => customProductsSelected[p.id])
              .map((p) => ({
                id: p.id,
                quantity: customProductQuantities[p.id] || 1,
                price: p.price,
              }))
          : undefined;

      // Créer la commande
      const orderResult = await createOrder({
        customerId: customerResult.customerId,
        basketId: selectedBasket?.id,
        pickupPoint,
        products: selectedProductsForOrder, // <-- important
      });

      // 4️⃣ Créer l'abonnement si besoin
      if (isSubscription) {
        await createSubscription({
          customerId: customerResult.customerId,
          basketType,
          weeks: 4,
          pickupPoint,
        });
      }

      // 5️⃣ Naviguer vers la confirmation
      navigate("/confirmation", {
        state: {
          orderNumber: orderResult.orderId,
          customer: formData,
          pickupPoint: pickupPoints.find((p) => p.id === pickupPoint),
          basket: selectedBasket,
          isSubscription,
          totalPrice,
        },
      });
    } catch (error) {
      console.error("Erreur commande:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la commande",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                Commander un panier
              </h1>
              <p className="text-muted-foreground">
                Choisissez votre point de retrait, votre panier et recevez des
                produits frais chaque semaine
              </p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-12">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {step > s ? <Check className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`w-16 md:w-24 h-1 transition-colors ${
                        step > s ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Point de retrait */}
            {step === 1 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    Choisissez votre point de retrait
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez où vous souhaitez récupérer votre panier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={pickupPoint}
                    onValueChange={setPickupPoint}
                  >
                    <div className="grid gap-4">
                      {pickupPoints.map((point) => (
                        <label
                          key={point.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            pickupPoint === point.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem value={point.id} id={point.id} />
                          <div>
                            <p className="font-semibold text-foreground">
                              {point.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {point.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  <div className="mt-8 flex justify-end">
                    <Button onClick={handleNext} disabled={!pickupPoint}>
                      Continuer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Type de panier */}
            {/* Step 2: Type de panier */}
            {step === 2 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBasket className="w-5 h-5 text-primary" />
                    Choisissez votre panier
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le type de panier qui vous convient
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={basketType} onValueChange={setBasketType}>
                    {loadingBaskets ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-3 gap-6">
                        {basketsUI.map((basket) => (
                          <label
                            key={basket.id}
                            className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-stretch ${
                              basketType === basket.id
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <RadioGroupItem
                              value={basket.id}
                              id={basket.id}
                              className="sr-only"
                            />
                            <img
                              src={basket.image || basketFruits}
                              alt={basket.name}
                              className="w-full aspect-square object-cover rounded-t-2xl"
                            />
                            <div className="p-6 bg-card flex flex-col gap-2">
                              <span className="font-semibold text-foreground text-center">
                                {basket.name}
                              </span>
                              {selectedBasket && basketType === basket.id && (
                                <span className="text-lg font-bold text-accent text-center">
                                  {selectedBasket.price}€
                                </span>
                              )}
                            </div>

                            {basketType === basket.id && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    )}
                  </RadioGroup>

                  {/* Option abonnement */}
                  <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox
                        id="subscription"
                        checked={isSubscription}
                        onCheckedChange={(checked) =>
                          setIsSubscription(checked === true)
                        }
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            S'abonner pour 4 semaines
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Recevez votre panier chaque semaine pendant 4 semaines
                          consécutives
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Retour
                    </Button>
                    <Button onClick={handleNext} disabled={!basketType}>
                      Continuer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Produits de la semaine */}
            {step === 3 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-primary" />
                    Produits du panier
                  </CardTitle>
                  <CardDescription>
                    Voici les produits contenus dans votre panier sélectionné
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBaskets ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {loadingProducts ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : basketType !== "personnalise" ? (
                        selectedBasket?.products?.map((product) => (
                          <div
                            key={product.id}
                            className="relative p-4 rounded-xl border border-border text-center"
                          >
                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                              {product.category === "fruit" ? (
                                <Apple className="w-5 h-5 text-primary" />
                              ) : (
                                <Carrot className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <p className="font-medium text-foreground text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Quantité : {product.quantity}
                            </p>
                          </div>
                        ))
                      ) : (
                        selectedBasket?.products?.map((product) => {
                          const isSelected =
                            !!customProductsSelected[product.id];
                          const quantity =
                            customProductQuantities[product.id] || 1;

                          return (
                            <div
                              key={product.id}
                              className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                                isSelected
                                  ? "border-primary ring-2 ring-primary/20"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                                {product.category === "fruit" ? (
                                  <Apple className="w-5 h-5 text-primary" />
                                ) : (
                                  <Carrot className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <p className="font-medium text-foreground text-sm">
                                {product.name}
                              </p>

                              {/* Checkbox sélection */}
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  setCustomProductsSelected((prev) => ({
                                    ...prev,
                                    [product.id]: !prev[product.id],
                                  }))
                                }
                                className="absolute top-2 right-2 w-5 h-5 cursor-pointer"
                              />

                              {/* Sélecteur de quantité */}
                              {isSelected && (
                                <div className="flex items-center justify-center mt-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCustomProductQuantities((prev) => ({
                                        ...prev,
                                        [product.id]: Math.max(1, quantity - 1),
                                      }))
                                    }
                                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm"
                                  >
                                    -
                                  </button>
                                  <span className="text-sm">{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCustomProductQuantities((prev) => ({
                                        ...prev,
                                        [product.id]: quantity + 1,
                                      }))
                                    }
                                    className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Retour
                    </Button>
                    <Button onClick={handleNext}>Continuer</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Formulaire client */}
            {step === 4 && (
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Vos informations
                  </CardTitle>
                  <CardDescription>
                    Remplissez vos coordonnées pour finaliser la commande
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Récapitulatif */}
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                      <h4 className="font-semibold text-foreground mb-3">
                        Récapitulatif
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Point de retrait
                          </span>
                          <span className="text-foreground">
                            {
                              pickupPoints.find((p) => p.id === pickupPoint)
                                ?.name
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Panier</span>
                          <span className="text-foreground">
                            {selectedBasket?.name}
                          </span>
                        </div>
                        {isSubscription && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Abonnement
                            </span>
                            <span className="text-foreground">4 semaines</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-border font-semibold">
                          <span className="text-foreground">Total</span>
                          <span className="text-accent">{totalPrice}€</span>
                        </div>
                      </div>
                    </div>

                    {/* Champs du formulaire */}
                    <div className="space-y-4">
                      <div>
                        <Label
                          htmlFor="name"
                          className="flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Nom complet *
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Jean Dupont"
                          className="mt-1.5"
                        />
                        {errors.name && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="jean.dupont@email.com"
                          className="mt-1.5"
                        />
                        {errors.email && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Téléphone *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="06 12 34 56 78"
                          className="mt-1.5"
                        />
                        {errors.phone && (
                          <p className="text-destructive text-sm mt-1">
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-muted/50 border border-border">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <Checkbox
                            id="rgpd"
                            checked={formData.rgpdConsent}
                            onCheckedChange={(checked) =>
                              setFormData({
                                ...formData,
                                rgpdConsent: checked === true,
                              })
                            }
                            className="mt-1"
                          />
                          <div className="text-sm">
                            <span className="text-foreground">
                              J'accepte que mes données personnelles soient
                              traitées conformément à la{" "}
                              <a
                                href="#"
                                className="text-primary underline hover:no-underline"
                              >
                                politique de confidentialité
                              </a>{" "}
                              du Verger du Coin. *
                            </span>
                          </div>
                        </label>
                        {errors.rgpdConsent && (
                          <p className="text-destructive text-sm mt-2">
                            {errors.rgpdConsent}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(3)}
                      >
                        Retour
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Traitement...
                          </>
                        ) : (
                          "Confirmer la commande"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
