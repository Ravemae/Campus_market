import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import AISupportWidget from '../components/AISupportWidget';

export default function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main className={isLandingPage ? "" : "max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8"}>
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 py-6 sm:py-8 mt-8 sm:mt-16 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm text-gray-600">
            © {new Date().getFullYear()} QuickMart. Built for campus communities.
          </p>
        </div>
      </footer>
      <BottomNav />
      <AISupportWidget />
    </div>
  );
}
