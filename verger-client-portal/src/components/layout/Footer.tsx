import { Leaf, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold">Le Verger du Coin</h3>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Exploitation agricole familiale depuis 1985. Nous cultivons avec passion 
              des fruits et légumes de saison, dans le respect de la terre et des saisons.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>123 Chemin des Vergers, 12345 Commune</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>01 23 45 67 89</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>contact@verger-du-coin.fr</span>
              </li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/commander" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Commander un panier
                </Link>
              </li>
              <li>
                <Link to="/fidelite" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Programme fidélité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© {new Date().getFullYear()} Le Verger du Coin. Tous droits réservés.</p>
          <p className="mt-1">Portail client connecté à notre système de gestion intégré.</p>
        </div>
      </div>
    </footer>
  );
}
