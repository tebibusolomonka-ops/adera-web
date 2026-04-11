import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="pb-32 md:pb-0 md:pt-20 max-w-7xl mx-auto min-h-screen flex-1 w-full">
        <Outlet />
      </main>
      <footer className="hidden md:block border-t border-white/5 py-4 text-center">
        <p className="text-gray-500 text-xs font-medium">© 2026 Adera. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
