import apiClient from './client';
import type {
  AuthResponse,
  Vendor,
  Product,
  Order,
  CartItem,
  VendorReviews,
  Notification,
  User,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const resolveMediaUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `${window.location.protocol}${url}`;
  
  // Ensure we don't have double slashes when joining API_URL and url
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${path}`;
};

/* ─── Auth ─── */
export const loginUser = (email: string, password: string, captcha_token: string) =>
  apiClient.post<AuthResponse>('/auth/login', { email, password, captcha_token });

export const googleLogin = (token: string) =>
  apiClient.post<AuthResponse>('/auth/google', { token });

export const signupUser = (data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  captcha_token: string;
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
  captcha_token: string;
}) => apiClient.post<AuthResponse>('/auth/signup/vendor', data);

export const forgotPassword = (email: string) =>
  apiClient.post('/auth/forgot-password', null, { params: { email } });

export const verifyOtp = (otp_code: string) =>
  apiClient.post('/auth/verify-otp', null, { params: { otp_code } });

export const resetPassword = (data: { email: string; new_password: string }) =>
  apiClient.post('/auth/reset-password', data);

export const updateProfile = (userId: string, data: Partial<User>) =>
  apiClient.patch<{ message: string; user: User }>(`/auth/profile/${userId}`, data);

/* ─── Vendors ─── */
export const getVendors = () =>
  apiClient.get<Vendor[]>('/vendors/');

export const getFeaturedVendors = () =>
  apiClient.get<Vendor[]>('/vendors/featured');

export const getMyVendor = () =>
  apiClient.get<Vendor>('/vendors/me');

export const getVendor = (id: string) =>
  apiClient.get<Vendor>(`/vendors/${id}`);

export const getAllVendorsAdmin = () =>
  apiClient.get<Vendor[]>('/admin/vendors');

export const approveVendor = (vendorId: string) =>
  apiClient.patch(`/admin/vendors/${vendorId}/approve`);

export const rejectVendor = (vendorId: string) =>
  apiClient.patch(`/admin/vendors/${vendorId}/reject`);

export const getAdminDashboard = () =>
  apiClient.get('/admin/dashboard');

export const getAllUsersAdmin = () =>
  apiClient.get('/admin/users');

export const deactivateUser = (userId: string) =>
  apiClient.patch(`/admin/users/${userId}/deactivate`);

export const activateUser = (userId: string) =>
  apiClient.patch(`/admin/users/${userId}/activate`);

/* ─── Products ─── */
export const getProducts = (params?: { q?: string; category?: string }) =>
  apiClient.get<Product[]>('/products/', { params });

export const getProduct = (id: string) =>
  apiClient.get<Product>(`/products/${id}`);

export const getVendorProducts = (vendorId: string, params?: { include_unavailable?: boolean }) =>
  apiClient.get<Product[]>(`/products/vendor/${vendorId}`, { params });

export const getMyProducts = () =>
  apiClient.get<Product[]>('/products/my-products');

export const createProduct = (data: {
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
  stock_quantity?: number;
}) => apiClient.post<Product>('/products/', data);

export const updateProduct = (productId: string, data: Partial<Product>) =>
  apiClient.patch<Product>(`/products/${productId}`, data);

export const deleteProduct = (productId: string) =>
  apiClient.delete(`/products/${productId}`);

/* ─── Cart (server-side) ─── */
export const getCart = () =>
  apiClient.get<CartItem[]>('/cart/');

export const addToCart = (product_id: string, quantity: number = 1) =>
  apiClient.post<CartItem>('/cart/', { product_id, quantity });

export const updateCartItem = (itemId: string, quantity: number) =>
  apiClient.patch<CartItem>(`/cart/${itemId}`, { quantity });

export const removeCartItem = (itemId: string) =>
  apiClient.delete(`/cart/${itemId}`);

export const clearCart = () =>
  apiClient.delete('/cart/clear/all');

/* ─── Orders ─── */
export const createOrder = (data: {
  vendor_id: string;
  total_amount: number;
  delivery_type: 'pickup' | 'delivery';
  hostel_name?: string;
  room_number?: string;
  delivery_address?: string;
}) => apiClient.post<Order>('/orders/', data);

export const getUserOrders = () =>
  apiClient.get<Order[]>('/orders/my-orders');

export const getVendorOrders = () =>
  apiClient.get<Order[]>('/orders/vendor-orders');

export const updateOrderStatus = (orderId: string, status: string) =>
  apiClient.patch(`/orders/${orderId}/status`, null, { params: { status } });

export const getHostels = () =>
  apiClient.get<{ hostels: string[] }>('/orders/hostels');

/* ─── Reviews ─── */
export const getVendorReviews = (vendorId: string) =>
  apiClient.get<VendorReviews>(`/reviews/vendor/${vendorId}`);

export const createReview = (data: {
  vendor_id: string;
  order_id: string;
  rating: number;
  comment?: string;
}) => apiClient.post('/reviews', data);

/* ─── Payment ─── */
export const initializePayment = (orderId: string) =>
  apiClient.post(`/payment/initialize/${orderId}`);

export const verifyPayment = (reference: string) =>
  apiClient.get(`/payment/verify/${reference}`);

/* ─── Flutterwave Payment ─── */
export const initializeFlutterwavePayment = (orderId: string) =>
  apiClient.post(`/flutterwave/initialize/${orderId}`);

export const verifyFlutterwavePayment = (txRef: string) =>
  apiClient.get(`/flutterwave/verify/${txRef}`);

/* ─── Notifications ─── */
export const getNotifications = () =>
  apiClient.get<Notification[]>('/notifications/');

export const markAsRead = (id: string) =>
  apiClient.patch(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  apiClient.patch('/notifications/read-all');

/* ─── Helpdesk / AI Support ─── */
export const sendHelpdeskMessage = (message: string, conversation_history: any[] = []) =>
  apiClient.post('/helpdesk/chat', { message, conversation_history });

/* ─── Upload ─── */
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post<{ filename: string; url: string; size: number }>(
    '/upload/',
    formData
  );
};
