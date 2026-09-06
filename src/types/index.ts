export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price: number | null;
  category_id: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  district: string;
  address: string;
  payment_method: string;
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  selected_size: string;
  selected_color: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface StoreSettings {
  id: number;
  store_name: string;
  whatsapp_number: string;
  bkash_number: string;
  delivery_charge_inside: number;
  delivery_charge_outside: number;
  facebook_url: string;
  instagram_url: string;
  contact_number: string;
  contact_email: string;
  footer_description: string;
}
