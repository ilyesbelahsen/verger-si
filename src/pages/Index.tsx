import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { Apple, Carrot, ShoppingBasket, MapPin, Calendar, Heart, ArrowRight, Leaf, Sun, Droplets } from 'lucide-react';
import heroImage from '@/assets/hero-orchard.jpg';
import basketFruits from '@/assets/basket-fruits.jpg';
import basketVegetables from '@/assets/basket-vegetables.jpg';
import basketMixed from '@/assets/basket-mixed.jpg';

const baskets = [
  {
    id: 'fruits',
    name: 'Panier Fruits',
    price: 10,
    description: 'Pommes, poires et fruits de saison du verger',
    image: basketFruits,
    icon: Apple,
  },
  {
    id: 'legumes',
    name: 'Panier Légumes',
    price: 15,
    description: 'Légumes frais du potager bio',
    image: basketVegetables,
    icon: Carrot,
  },
  {
    id: 'mixte',
    name: 'Panier Mixte',
    price: 20,
    description: 'Le meilleur des fruits et légumes réunis',
    image: basketMixed,
    icon: ShoppingBasket,
  },
];

const features = [
  {
    icon: Sun,
    title: 'Culture raisonnée',
    description: 'Respect des cycles naturels et réduction des intrants chimiques',
  },
  {
    icon: Droplets,
    title: 'Irrigation économe',
    description: 'Système de goutte-à-goutte pour préserver les ressources en eau',
  },
  {
    icon: Leaf,
    title: 'Biodiversité',
    description: 'Haies et prairies fleuries pour accueillir les pollinisateurs',
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Le Verger du Coin - Verger au coucher de soleil"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-accent/90 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Leaf className="w-4 h-4" />
              Exploitation familiale depuis 1985
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Le Verger du Coin
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Fruits et légumes de saison, cultivés avec passion dans le respect 
              de la terre. Commandez votre panier et venez le récupérer 
              à la ferme ou au marché.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Button asChild variant="hero" size="xl">
                <Link to="/commander">
                  Commander un panier
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/fidelite">
                  Programme fidélité
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pickup Points */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Points de retrait
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trois options pratiques pour récupérer vos paniers frais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Retrait à la ferme', schedule: 'Du mardi au samedi, 9h-18h', icon: MapPin },
              { name: 'Marché du samedi', schedule: 'Place centrale, Ville X, 8h-13h', icon: Calendar },
              { name: 'Marché du dimanche', schedule: 'Halle couverte, Ville Y, 8h-13h', icon: Calendar },
            ].map((point, index) => (
              <div
                key={point.name}
                className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {point.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {point.schedule}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Baskets Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Nos Paniers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Composés chaque semaine avec les produits de saison, 
              nos paniers vous garantissent fraîcheur et qualité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {baskets.map((basket, index) => (
              <div
                key={basket.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={basket.image}
                    alt={basket.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {basket.name}
                    </h3>
                    <span className="text-2xl font-bold text-accent">
                      {basket.price}€
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {basket.description}
                  </p>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/commander">
                      Choisir ce panier
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              Notre engagement
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Une agriculture responsable pour des produits de qualité
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-foreground/80 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="bg-card-gradient rounded-3xl p-8 md:p-12 shadow-elevated text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Rejoignez notre programme fidélité
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Inscrivez-vous et bénéficiez d'avantages exclusifs : 
              réductions, accès prioritaire aux nouveaux produits, 
              et invitations aux événements de la ferme.
            </p>
            <Button asChild variant="accent" size="lg">
              <Link to="/fidelite">
                S'inscrire au programme
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
