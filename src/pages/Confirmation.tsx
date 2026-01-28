import { useLocation, Link, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, MapPin, ShoppingBasket, User, Calendar, Home, ArrowRight } from 'lucide-react';

interface ConfirmationState {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  pickupPoint: {
    id: string;
    name: string;
    description: string;
  };
  basket: {
    id: string;
    name: string;
    price: number;
  };
  isSubscription: boolean;
  totalPrice: number;
}

export default function Confirmation() {
  const location = useLocation();
  const state = location.state as ConfirmationState | null;

  // Si pas de state, rediriger vers la page de commande
  if (!state) {
    return <Navigate to="/commander" replace />;
  }

  return (
    <Layout>
      <div className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Success Animation */}
            <div className="text-center mb-8 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-primary" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">
                Commande confirmée !
              </h1>
              <p className="text-muted-foreground">
                Merci pour votre commande, {state.customer.name.split(' ')[0]} !
              </p>
            </div>

            {/* Order Details */}
            <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="text-center mb-6 pb-6 border-b border-border">
                  <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
                  <p className="text-2xl font-bold font-mono text-foreground">{state.orderNumber}</p>
                </div>

                <div className="space-y-4">
                  {/* Panier */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ShoppingBasket className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{state.basket.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {state.isSubscription ? 'Abonnement 4 semaines' : 'Commande unique'}
                      </p>
                    </div>
                    <span className="ml-auto text-lg font-bold text-accent">{state.totalPrice}€</span>
                  </div>

                  {/* Point de retrait */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{state.pickupPoint.name}</p>
                      <p className="text-sm text-muted-foreground">{state.pickupPoint.description}</p>
                    </div>
                  </div>

                  {/* Client */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{state.customer.name}</p>
                      <p className="text-sm text-muted-foreground">{state.customer.email}</p>
                      <p className="text-sm text-muted-foreground">{state.customer.phone}</p>
                    </div>
                  </div>

                  {/* Prochaine livraison */}
                  <div className="flex items-start gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Prochaine disponibilité</p>
                      <p className="text-sm text-muted-foreground">
                        Votre panier sera prêt dès ce week-end au point de retrait choisi
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Box */}
            <div className="p-6 rounded-xl bg-secondary/50 border border-border mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="font-semibold text-foreground mb-2">📧 Confirmation envoyée</h3>
              <p className="text-sm text-muted-foreground">
                Un email de confirmation a été envoyé à <strong>{state.customer.email}</strong> avec 
                tous les détails de votre commande.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/fidelite">
                  Rejoindre le programme fidélité
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
