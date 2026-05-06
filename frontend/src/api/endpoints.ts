import apiClient from './client';
import type {
  AuthResponse,
  Vendor,
  Product,
  Order,
  CartItem,
  VendorReviews,
  OrderItemCreate,
  Notification,
} from '../types';

/* ─── Auth ─── */
export const loginUser = (email: string, password: string) =>
  apiClient.post<AuthResponse>('/auth/login', { email, password });

export const signupUser = (data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}) => apiClient.post<AuthResponse>('/auth/signup/user', data);

export const signupVendor = (data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  shop_name: string;
  shop_description: string;
  shop_location: string;
  shop_category: string;
}) => apiClient.post<AuthResponse>('/auth/signup/vendor', data);

/* ─── Vendors ─── */
export const getVendors = () =>
  apiClient.get<Vendor[]>('/vendors');

export const getMyVendor = () =>
  apiClient.get<Vendor>('/vendors/me');

export const getVendor = (id: number) =>
  apiClient.get<Vendor>(`/vendors/${id}`);

export const getAllVendorsAdmin = () =>
  apiClient.get<Vendor[]>('/vendors/admin/all');

export const approveVendor = (vendorId: number) =>
  apiClient.patch(`/vendors/${vendorId}/approve`);

export const getAdminDashboard = () =>
  apiClient.get('/admin/dashboard');

/* ─── Products ─── */
export const getProducts = (params?: { q?: string; category?: string }) =>
  apiClient.get<Product[]>('/products', { params });

export const getProduct = (id: number) =>
  apiClient.get<Product>(`/products/${id}`);

export const getVendorProducts = (vendorId: number, params?: { include_unavailable?: boolean }) =>
  apiClient.get<Product[]>(`/products/vendor/${vendorId}`, { params });

export const createProduct = (data: {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  stock_quantity?: number;
}) => apiClient.post<Product>('/products/', data);

export const updateProduct = (productId: number, data: Partial<Product>) =>
  apiClient.patch<Product>(`/products/${productId}`, data);

export const deleteProduct = (productId: number) =>
  apiClient.delete(`/products/${productId}`);

/* ─── Cart (server-side) ─── */
export const getCart = () =>
  apiClient.get<CartItem[]>('/cart');

export const addToCart = (product_id: number, quantity: number = 1) =>
  apiClient.post<CartItem>('/cart', { product_id, quantity });

export const updateCartItem = (itemId: number, quantity: number) =>
  apiClient.patch<CartItem>(`/cart/${itemId}`, { quantity });

export const removeCartItem = (itemId: number) =>
  apiClient.delete(`/cart/${itemId}`);

export const clearCart = () =>
  apiClient.delete('/cart/clear/all');

/* ─── Orders ─── */
export const createOrder = (data: {
  vendor_id: number;
  items: OrderItemCreate[];
  delivery_type: 'pickup' | 'delivery';
  hostel_name?: string;
  room_number?: string;
}) => apiClient.post<Order>('/orders', data);

export const getUserOrders = (userId: number) =>
  apiClient.get<Order[]>(`/orders/user/${userId}`);

export const getVendorOrders = (vendorId: number) =>
  apiClient.get<Order[]>(`/orders/vendor/${vendorId}`);

export const updateOrderStatus = (orderId: number, status: string) =>
  apiClient.patch(`/orders/${orderId}/status`, null, { params: { status } });

export const getHostels = () =>
  apiClient.get<{ hostels: string[] }>('/orders/hostels');

/* ─── Reviews ─── */
export const getVendorReviews = (vendorId: number) =>
  apiClient.get<VendorReviews>(`/reviews/vendor/${vendorId}`);

export const createReview = (data: {
  vendor_id: number;
  order_id: number;
  rating: number;
  comment?: string;
}) => apiClient.post('/reviews', data);

/* ─── Payment ─── */
export const initializePayment = (orderId: number) =>
  apiClient.post(`/payment/initialize/${orderId}`);

export const verifyPayment = (reference: string) =>
  apiClient.get(`/payment/verify/${reference}`);

/* ─── Notifications ─── */
export const getNotifications = () =>
  apiClient.get<Notification[]>('/notifications');

export const markAsRead = (id: number) =>
  apiClient.patch(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  apiClient.patch('/notifications/read-all');

/* ─── Upload ─── */
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<{ filename: string; url: string; size: number }>(
    '/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
};
