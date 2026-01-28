/**
 * Service de simulation API Odoo
 * Ces fonctions simulent les appels à l'API REST Odoo
 * À remplacer plus tard par de vrais appels API
 */

export interface Product {
  id: number;
  name: string;
  category: 'fruit' | 'legume';
  origin: string;
  unit: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  rgpdConsent: boolean;
}

export interface Order {
  customerId?: number;
  customer: Customer;
  pickupPoint: string;
  basketType: string;
  basketPrice: number;
  isSubscription: boolean;
  subscriptionWeeks?: number;
}

export interface Subscription {
  customerId: number;
  basketType: string;
  weeks: number;
  pickupPoint: string;
}

// Produits simulés de la semaine
const weeklyProducts: Product[] = [
  { id: 1, name: 'Pommes Golden', category: 'fruit', origin: 'Verger local', unit: 'kg' },
  { id: 2, name: 'Poires Williams', category: 'fruit', origin: 'Verger local', unit: 'kg' },
  { id: 3, name: 'Carottes', category: 'legume', origin: 'Potager bio', unit: 'botte' },
  { id: 4, name: 'Poireaux', category: 'legume', origin: 'Potager bio', unit: 'botte' },
  { id: 5, name: 'Pommes de terre', category: 'legume', origin: 'Champ Nord', unit: 'kg' },
  { id: 6, name: 'Coings', category: 'fruit', origin: 'Verger local', unit: 'kg' },
  { id: 7, name: 'Courge Butternut', category: 'legume', origin: 'Potager bio', unit: 'pièce' },
  { id: 8, name: 'Épinards', category: 'legume', origin: 'Serre', unit: 'sachet' },
];

/**
 * Récupère les produits disponibles cette semaine
 * Simulation: retourne une liste statique
 * API Odoo: GET /api/v1/products?available=true&week=current
 */
export async function getWeeklyProducts(): Promise<Product[]> {
  console.log('[ODOO API] GET /api/v1/products - Fetching weekly products');
  
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log('[ODOO API] Response:', JSON.stringify(weeklyProducts, null, 2));
  return weeklyProducts;
}

/**
 * Crée un nouveau client dans Odoo
 * Simulation: log les données et retourne un ID fictif
 * API Odoo: POST /api/v1/customers
 */
export async function createCustomer(data: Customer): Promise<{ success: boolean; customerId: number }> {
  console.log('[ODOO API] POST /api/v1/customers - Creating customer');
  console.log('[ODOO API] Request body:', JSON.stringify(data, null, 2));
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const response = { success: true, customerId: Math.floor(Math.random() * 10000) };
  console.log('[ODOO API] Response:', JSON.stringify(response, null, 2));
  
  return response;
}

/**
 * Crée une commande de panier
 * Simulation: log les données et retourne un numéro de commande
 * API Odoo: POST /api/v1/orders
 */
export async function createOrder(data: Order): Promise<{ success: boolean; orderId: string; orderNumber: string }> {
  console.log('[ODOO API] POST /api/v1/orders - Creating order');
  console.log('[ODOO API] Request body:', JSON.stringify(data, null, 2));
  
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const orderNumber = `VDC-${Date.now().toString().slice(-6)}`;
  const response = { 
    success: true, 
    orderId: Math.floor(Math.random() * 100000).toString(),
    orderNumber 
  };
  console.log('[ODOO API] Response:', JSON.stringify(response, null, 2));
  
  return response;
}

/**
 * Crée un abonnement panier (4 semaines)
 * Simulation: log les données et retourne un ID d'abonnement
 * API Odoo: POST /api/v1/subscriptions
 */
export async function createSubscription(data: Subscription): Promise<{ success: boolean; subscriptionId: number }> {
  console.log('[ODOO API] POST /api/v1/subscriptions - Creating subscription');
  console.log('[ODOO API] Request body:', JSON.stringify(data, null, 2));
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const response = { success: true, subscriptionId: Math.floor(Math.random() * 10000) };
  console.log('[ODOO API] Response:', JSON.stringify(response, null, 2));
  
  return response;
}

/**
 * Inscrit un client au programme fidélité
 * Simulation: log les données et retourne un statut
 * API Odoo: POST /api/v1/loyalty/register
 */
export async function registerLoyalty(data: Customer): Promise<{ success: boolean; loyaltyId: number; points: number }> {
  console.log('[ODOO API] POST /api/v1/loyalty/register - Registering to loyalty program');
  console.log('[ODOO API] Request body:', JSON.stringify(data, null, 2));
  
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const response = { 
    success: true, 
    loyaltyId: Math.floor(Math.random() * 10000),
    points: 50 // Points de bienvenue
  };
  console.log('[ODOO API] Response:', JSON.stringify(response, null, 2));
  
  return response;
}
