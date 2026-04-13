import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories } from '../services/listing_service';
import type { Category } from '../services/listing_service';
import { CATEGORIES } from '../data/mockData';
import * as LucideIcons from 'lucide-react';

const Buy = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(data => {
      if (data.length === 0) {
        setCategories(CATEGORIES);
      } else {
        setCategories(data);
      }
    }).catch(err => {
      console.error(err);
      setCategories(CATEGORIES);
    });
  }, []);

  const filteredCategories = categories.filter(category => {
    if (category.name === 'Twitter') return false; 
    return category.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      {/* Header / Search */}
      <div className="sticky top-0 z-10 bg-surface px-5 pt-4 pb-3 border-b border-white/5 shadow-md">
        <div className="flex items-center mb-3 mt-1">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 mr-2 hover:bg-white/10 rounded-full transition">
            <LucideIcons.ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <span className="text-xl font-bold text-white">Categories</span>
        </div>
        <div className="flex items-center bg-background rounded-xl px-4 h-12 border border-white/5">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white text-base"
          />
        </div>
      </div>

      <div className="px-5 flex-1">
        <h2 className="text-xl font-bold text-[#764ba2] text-center mt-5 mb-4">Categories</h2>
        
        <div className="flex flex-col gap-4">
          {filteredCategories.map(item => {
             const IconComp = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;
             return (
              <Link 
                to={`/listings?title=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.name)}`}
                key={item.id}
                className="flex items-center bg-surface p-4 rounded-2xl shadow-md border-l-[5px] w-full text-left transition-transform hover:-translate-y-1 mb-1"
                style={{ borderLeftColor: item.color || '#764ba2' }}
              >
                <div className="w-12 flex justify-center mr-3">
                  <IconComp className="w-7 h-7 text-white" />
                </div>
                <span className="text-lg font-bold text-white">{item.name}</span>
              </Link>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default Buy;
