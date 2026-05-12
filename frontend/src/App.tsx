import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VendorSignupPage from './pages/VendorSignupPage';
import VendorDetailPage from './pages/VendorDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProductsPage from './pages/ProductsPage';
import VendorsPage from './pages/VendorsPage';

import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OrdersPage from './pages/OrdersPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/vendor" element={<VendorSignupPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="vendor/:vendorId" element={<VendorDetailPage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="vendors" element={<VendorsPage />} />

        {/* Customer Protected Routes */}
        <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="checkout/verify" element={<PaymentVerifyPage />} />
        <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Vendor Protected Routes */}
        <Route path="vendor-dashboard" element={
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboardPage />
          </ProtectedRoute>
        } />

        {/* Admin Protected Routes */}
        <Route path="admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}
