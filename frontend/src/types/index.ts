/* === Types for QuickMart === */

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'vendor' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  owner_id: string;
  shop_name: string;
  description: string;
  location: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  is_approved: boolean;
  is_featured?: boolean;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  stock_quantity: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderItemCreate {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  vendor_id: string;
  total_amount: number;
  delivery_type: 'pickup' | 'delivery';
  status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
  is_paid: boolean;
  customer_name: string;
  created_at: string;
  hostel_name?: string;
  room_number?: string;
  delivery_address?: string;
  items?: OrderItem[]; // Made optional as backend currently doesn't return them
  vendor_name?: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  product_name: string;
  product_price: number;
  product_image_url: string;
  vendor_id: string;
}

export interface Review {
  id: string;
  user_id: string;
  vendor_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name: string;
}

export interface VendorReviews {
  vendor_id: string;
  average_rating: number;
  total_reviews: number;
  reviews: Review[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

/* Cart store item (frontend-only, Zustand) */
export interface CartStoreItem {
  productId: string;
  vendorId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'general' | 'order' | 'payment' | 'review';
  is_read: boolean;
  created_at: string;
}
