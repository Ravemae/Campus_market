import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import AISupportWidget from '../components/AISupportWidget';
import Footer from '../components/Footer';

export default function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main className={isLandingPage ? "" : "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8"}>
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <AISupportWidget />
    </div>
  );
}
