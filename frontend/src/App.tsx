import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import VendorSignupPage from './pages/VendorSignupPage';
import VendorDetailPage from './pages/VendorDetailPage';
import ProductDetailPage from './pages/ProductDetailPage';

import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentVerifyPage from './pages/PaymentVerifyPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="signup/vendor" element={<VendorSignupPage />} />
        <Route path="vendor/:vendorId" element={<VendorDetailPage />} />
        <Route path="product/:productId" element={<ProductDetailPage />} />

        {/* Customer Protected Routes */}
        <Route path="cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="checkout/verify" element={<ProtectedRoute><PaymentVerifyPage /></ProtectedRoute>} />
        <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />

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
