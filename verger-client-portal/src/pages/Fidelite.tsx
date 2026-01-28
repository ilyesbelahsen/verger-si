import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Gift, Star, Percent, User, Mail, Phone, Loader2, CheckCircle } from 'lucide-react';
import { registerLoyalty } from '@/services/odooService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Schema de validation
const loyaltySchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom est trop long"),
  email: z.string().trim().email("Adresse email invalide").max(255, "L'email est trop long"),
  phone: z.string().trim().min(10, "Numéro de téléphone invalide").max(20, "Numéro trop long"),
  rgpdConsent: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter les conditions RGPD" }),
  }),
});

const benefits = [
  {
    icon: Star,
    title: '10 points de bienvenue',
    description: 'Offerts dès votre inscription au programme',
  },
  {
    icon: Percent,
    title: 'Réductions exclusives',
    description: 'Jusqu\'à 10% de réduction sur vos paniers',
  },
  {
    icon: Gift,
    title: 'Produits offerts',
    description: 'Des surprises dans vos paniers tout au long de l\'année',
  },
];

export default function Fidelite() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    rgpdConsent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation avec Zod
    const validation = loyaltySchema.safeParse(formData);
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
      const result = await registerLoyalty({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        rgpdConsent: formData.rgpdConsent,
      });

      setLoyaltyPoints(result.points);
      setSuccess(true);
      
      toast({
        title: "Inscription réussie !",
        description: `Bienvenue dans le programme fidélité ! Vous avez reçu ${result.points} points.`,
      });
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <div className="animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  Bienvenue au programme !
                </h1>
                <p className="text-muted-foreground mb-8">
                  Vous êtes maintenant membre du programme fidélité Le Verger du Coin.
                </p>
              </div>

              <Card className="mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <Star className="w-8 h-8 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="text-3xl font-bold text-foreground">{loyaltyPoints}</p>
                      <p className="text-muted-foreground">points de bienvenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => navigate('/commander')} size="lg" className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Commander un panier
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Programme Fidélité
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Rejoignez notre programme fidélité et bénéficiez d'avantages exclusifs 
              pour récompenser votre confiance.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="text-center p-6 rounded-xl bg-card shadow-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Form */}
          <Card className="max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle>Inscription au programme</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous pour rejoindre le programme fidélité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nom complet *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jean Dupont"
                    className="mt-1.5"
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean.dupont@email.com"
                    className="mt-1.5"
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="06 12 34 56 78"
                    className="mt-1.5"
                  />
                  {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
                </div>

                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      id="rgpd"
                      checked={formData.rgpdConsent}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, rgpdConsent: checked === true })
                      }
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <span className="text-foreground">
                        J'accepte de recevoir des communications commerciales et que mes données 
                        personnelles soient traitées conformément à la{' '}
                        <a href="#" className="text-primary underline hover:no-underline">
                          politique de confidentialité
                        </a>{' '}
                        du Verger du Coin. *
                      </span>
                      <p className="text-muted-foreground mt-2 text-xs">
                        Conformément au RGPD, vous pouvez à tout moment retirer votre consentement 
                        en nous contactant.
                      </p>
                    </div>
                  </label>
                  {errors.rgpdConsent && (
                    <p className="text-destructive text-sm mt-2">{errors.rgpdConsent}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      S'inscrire au programme
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
