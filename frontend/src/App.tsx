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
import CompleteProfilePage from './pages/CompleteProfilePage';
import TermsPage from './pages/TermsPage';

import { useState, useEffect } from 'react';
import InstallBanner from './components/InstallBanner';

export default function App() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      
      // Show the banner after 30 seconds
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 30000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the stashed prompt
    setInstallPrompt(null);
    setShowBanner(false);
  };

  return (
    <>
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
        <Route path="terms" element={<TermsPage />} />
        <Route path="complete-profile" element={<ProtectedRoute><CompleteProfilePage /></ProtectedRoute>} />

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
    <InstallBanner 
      show={showBanner} 
      onInstall={handleInstall} 
      onClose={() => setShowBanner(false)} 
    />
    </>
  );
}
