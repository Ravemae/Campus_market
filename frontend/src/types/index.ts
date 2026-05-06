/* === Types for Campus Market === */

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: 'user' | 'vendor' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface Vendor {
  id: number;
  owner_id: number;
  shop_name: string;
  description: string;
  location: string;
  category: string;
  image_url?: string;
  is_active: boolean;
  is_approved: boolean;
}

export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  stock_quantity: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  vendor_id: number;
  total_amount: number;
  delivery_type: 'pickup' | 'delivery';
  status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
  is_paid: boolean;
  customer_name: string;
  created_at: string;
  hostel_name?: string;
  room_number?: string;
  items: OrderItem[];
}

export interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  added_at: string;
  product_name: string;
  product_price: number;
  product_image_url: string;
  vendor_id: number;
}

export interface Review {
  id: number;
  user_id: number;
  vendor_id: number;
  order_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name: string;
}

export interface VendorReviews {
  vendor_id: number;
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
/* Cart store item (frontend-only, Zustand) */
export interface CartStoreItem {
  productId: number;
  vendorId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: 'general' | 'order' | 'payment' | 'review';
  is_read: boolean;
  created_at: string;
}
