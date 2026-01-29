const API = "http://localhost:3001";

/* ================== CORE FETCH ================== */

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

/* ================== TYPES ================== */
/* ================== TYPES ================== */

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  sale_ok: boolean;
}

// Pour le panier côté UI
export interface BasketProduct {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price?: number;
}

export interface Basket {
  id: number;
  name: string;
  price: number;
  image?: string;
  products: BasketProduct[];
}

export interface CustomerPayload {
  name: string;
  email: string;
  phone: string;
  rgpdConsent: boolean;
}

// ✨ Nouveau type pour la commande envoyée au backend
export interface OrderProduct {
  id: number;
  quantity: number;
  price: number;
}

// ✨ Modifier OrderPayload pour utiliser OrderProduct[]
export interface OrderPayload {
  customerId: number;
  basketId: number;
  pickupPoint: string;
  products?: OrderProduct[];
  isDiscovery?: boolean;
}

export interface SubscriptionPayload {
  customerId: number;
  basketType: string;
  weeks: number;
  pickupPoint: string;
}

export interface LoyaltyPayload {
  name: string;
  email: string;
  phone: string;
  rgpdConsent: boolean;
}

export interface LoyaltyResponse {
  points: number;
}

export interface CustomerOrCreatePayload {
  name: string;
  email: string;
  phone: string;
  rgpdConsent: boolean;
}

export function getOrCreateCustomer(data: CustomerOrCreatePayload) {
  return apiFetch<{ customerId: number }>("/customer-or-create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ================== PRODUCTS ================== */

export function getWeeklyProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

/* ================== BASKETS (KITS / BOM) ================== */

export function getAllBasketsWithProducts(): Promise<Basket[]> {
  return apiFetch<Basket[]>("/baskets-with-products");
}

/* ================== CUSTOMER ================== */

export function createCustomer(data: CustomerPayload) {
  return apiFetch<{ customerId: number }>("/customer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ================== ORDER ================== */

export function createOrder(data: OrderPayload) {
  return apiFetch<{ orderId: number }>("/order", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ================== SUBSCRIPTION ================== */

export function createSubscription(data: SubscriptionPayload) {
  return apiFetch<{ subscriptionId: number }>("/subscription", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ================== LOYALTY ================== */

export function registerLoyalty(data: LoyaltyPayload) {
  return apiFetch<LoyaltyResponse>("/loyalty/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
