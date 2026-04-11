import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { subscribeToListings } from '../services/listing_service';
import type { Listing } from '../services/listing_service';

const ListingList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const title = searchParams.get('title') || 'Items';
  const sortType = searchParams.get('sortType') || 'recent';
  const category = searchParams.get('category');
  const searchQuery = searchParams.get('searchQuery');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const [data, setData] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToListings(
      (listings) => {
        let items = [...listings];

        // Filter by Category
        if (category) {
          items = items.filter(item => item.category?.toLowerCase() === category.toLowerCase());
        }

        // Filter by Price
        if (minPrice) {
          items = items.filter(item => item.price >= Number(minPrice));
        }
        if (maxPrice) {
          items = items.filter(item => item.price <= Number(maxPrice));
        }

        // Filter by Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          items = items.filter(item => item.title?.toLowerCase().includes(q));
        }

        // Sort
        if (sortType === 'top' || sortType === 'price_desc') {
          items.sort((a, b) => b.price - a.price);
        } else if (sortType === 'price_asc') {
          items.sort((a, b) => a.price - b.price);
        } else {
          // recent default
          items.sort((a, b) => {
             const dA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
             const dB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
             return dB - dA;
          });
        }

        setData(items);
        setLoading(false);
      },
      (error) => {
        console.error("Listing fetch error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category, minPrice, maxPrice, searchQuery, sortType]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-4 border-b border-white/5 bg-surface sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition mr-2 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">{title}</h1>
      </div>

      {loading ? (
        <div className="flex justify-center p-10 mt-10">
          <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          {data.length > 0 ? (
            data.map(item => (
              <Link to={`/item/${item.id}`} key={item.id} className="flex bg-surface p-3 rounded-2xl shadow-sm border border-white/5 hover:bg-surfaceLight transition">
                <img src={item.image_url || 'https://via.placeholder.com/150'} alt={item.title} className="w-24 h-24 rounded-xl object-cover bg-gray-800" />
                <div className="flex-1 ml-4 flex flex-col justify-center">
                  <h3 className="text-[15px] font-bold text-white mb-1 line-clamp-2">{item.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400 capitalize">{item.category}</span>
                    {item.level && item.level > 0 && <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-gray-300">Lvl {item.level}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#667eea] font-black text-lg">{item.price} ETB</span>
                    <span className="text-[10px] text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <div className="flex flex-col items-center justify-center mt-20 opacity-50 px-5 text-center">
                <h2 className="text-lg font-bold text-white mb-2">No items found</h2>
                <p className="text-sm text-gray-400">Try adjusting your filters or search query.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListingList;
