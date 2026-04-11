
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, PlusCircle, Wallet, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const tabs = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Buy', path: '/buy', icon: ShoppingCart },
    { name: 'Sell', path: '/sell', icon: PlusCircle },
    { name: 'Transaction', path: '/transaction', icon: Wallet },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-surface border-t border-white/10 md:top-0 md:bottom-auto z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="hidden md:flex flex-shrink-0 items-center">
            <h1 className="text-xl font-bold text-primary-400">SocialTrade</h1>
          </div>
          <div className="flex w-full md:w-auto justify-around md:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
              
              return (
                <Link
                  key={tab.name}
                  to={tab.path}
                  className={`flex flex-col md:flex-row items-center justify-center p-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary-400' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-6 h-6 md:w-5 md:h-5 md:mr-2" />
                  <span className="text-[10px] md:text-sm mt-1 md:mt-0">{tab.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
