import { useState, useEffect } from 'react';
import { Search, Bell, Settings2, ShieldCheck, UserCircle, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { subscribeToListings } from '../services/listing_service';
import type { Listing, Category } from '../services/listing_service';
import { CATEGORIES } from '../data/mockData';
import FilterModal from '../components/FilterModal';
import { getUserNotifications } from '../services/notification_service';
import { useAuth } from '../context/AuthContext';

const getValidImageUrl = (url?: string) => {
  if (!url || url.startsWith('file://')) {
    return 'https://via.placeholder.com/150';
  }
  return url;
};

const TopItemCard = ({ item }: { item: Listing }) => (
  <Link to={`/item/${item.id}`} className="block flex-shrink-0 w-48 mr-4 bg-surface rounded-2xl overflow-hidden shadow-lg border border-white/5 pb-2">
    <img src={getValidImageUrl(item.image_url)} alt={item.title} className="w-full h-28 object-cover bg-[#FFD700]" />
    <div className="p-3 flex flex-col justify-between h-20">
      <h3 className="text-sm font-bold truncate text-white mb-1">{item.title}</h3>
      <div className="flex items-center text-xs flex-wrap gap-1">
        <span className="text-gray-400">@{item.category?.toLowerCase()}</span>
        <span className={`font-semibold ${item.category?.toLowerCase() === 'gaming' ? 'text-green-500' : 'text-blue-500'}`}>
          {item.category?.toLowerCase() === 'gaming' ? `Level ${item.level || 0}` : `${item.follower_count || 0} followers`}
        </span>
      </div>
    </div>
  </Link>
);

const RecentItemCard = ({ item }: { item: Listing }) => (
  <Link to={`/item/${item.id}`} className="flex flex-row items-center bg-surface p-2.5 mb-4 rounded-xl shadow-sm border border-white/5 hover:bg-white/5 transition">
    <div className="relative">
      <img src={getValidImageUrl(item.image_url)} alt={item.title} className="w-16 h-16 rounded-lg object-cover bg-[#eee]" />
      {item.status === 'sold' && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
          <span className="text-white text-[11px] font-bold transform -rotate-12 tracking-wider">SOLD</span>
        </div>
      )}
    </div>
    <div className="flex-1 ml-3 flex flex-col justify-center">
      <h3 className="text-[16px] font-bold text-white mb-1 truncate">{item.title}</h3>
      <div className="flex items-center mb-1 text-[12px]">
        <span className="text-gray-400">@{item.category?.toLowerCase()}</span>
        <span className="text-gray-500 mx-1">•</span>
        <span className={`font-semibold ${item.category?.toLowerCase() === 'gaming' ? 'text-green-500' : 'text-blue-500'}`}>
          {item.category?.toLowerCase() === 'gaming' ? `Level ${item.level || 0}` : `${item.follower_count || 0} followers`}
        </span>
      </div>
      <span className="text-[14px] font-bold text-white">{item.price} birr</span>
    </div>
  </Link>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch categories from mock since db is empty
    setCategories(CATEGORIES);

    // Subscribe to realtime listings
    const unsubscribeListings = subscribeToListings(
      (data) => {
        setListings(data);
        setLoading(false);
      },
      (error) => {
        console.error("Listing subscription error:", error);
        setLoading(false);
      }
    );

    let unsubscribeNotifications: () => void;
    if (user) {
        unsubscribeNotifications = getUserNotifications(user.uid, (data) => {
            const unread = data.filter(n => !n.read).length;
            setUnreadCount(unread);
        });
    }

    return () => {
        unsubscribeListings();
        if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, [user]);

  const handleApplyFilter = (filters: any) => {
    const params = new URLSearchParams();
    params.set('title', 'Filtered Items');
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    params.set('sortType', filters.sortType);
    
    navigate(`/listings?${params.toString()}`);
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      navigate(`/listings?title=Search Results&searchQuery=${encodeURIComponent(searchText)}`);
    }
  };

  const topItems = listings.slice(0, 5); // Just take first 5 for now 
  const recentItems = listings.slice(0, 10);

  const getIconComponent = (iconName: string) => {
    const mapping: Record<string, string> = {
      'telegram': 'Send',
      'instagram': 'Instagram',
      'music-note': 'Music',
      'twitter': 'Twitter',
      'youtube': 'Youtube',
      'facebook': 'Facebook',
      'linkedin': 'Linkedin',
      'discord': 'MessagesSquare',
      'reddit': 'Globe',
      'pinterest': 'Pin',
      'whatsapp': 'Phone',
      'controller-classic': 'Gamepad2'
    };
    
    const lucideName = mapping[iconName] || (iconName ? iconName.charAt(0).toUpperCase() + iconName.slice(1) : '');
    return (LucideIcons as any)[lucideName] || LucideIcons.HelpCircle;
  };

  return (
    <div className="p-4 pt-4 pb-24 md:pb-8 flex flex-col gap-6 relative">
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onApply={handleApplyFilter} 
      />
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-5 rounded-2xl shadow-lg flex justify-between items-center text-white">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3">
            <ShieldCheck className="w-5 h-5 text-[#667eea]" />
          </div>
          <span className="text-xl font-extrabold tracking-wide">Adera</span>
        </div>
        <Link to="/profile" className="flex items-center bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition">
          <span className="text-sm font-semibold mr-1">Welcome</span>
          <UserCircle className="w-5 h-5" />
        </Link>
      </div>

      {/* Header / Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center bg-white rounded-xl px-3 h-12 shadow-sm">
          <button onClick={handleSearch} className="focus:outline-none">
             <Search className="w-5 h-5 text-gray-400 mr-2" />
          </button>
          <input 
            type="text" 
            placeholder="Search items..." 
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-transparent border-none outline-none text-black text-base"
          />
          <button className="bg-[#764ba2] p-1.5 rounded-lg text-white ml-2" onClick={() => setIsFilterOpen(true)}>
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
        
        <Link to="/notifications" className="bg-surfaceLight p-3 rounded-xl shadow-sm relative text-gray-300 hover:bg-white/10 transition block">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surfaceLight"></span>
          )}
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-6">
        
        {searchText.trim().length > 0 ? (
          <div className="flex flex-col bg-background flex-1 min-h-[50vh]">
            <h2 className="text-lg font-bold text-gray-400 mt-2 mb-4">Search Results</h2>
            {listings.filter(i => i.title.toLowerCase().includes(searchText.toLowerCase())).length > 0 ? (
               <div className="flex flex-col">
                 {listings.filter(i => i.title.toLowerCase().includes(searchText.toLowerCase())).map(item => (
                   <RecentItemCard key={item.id} item={item} />
                 ))}
               </div>
            ) : (
               <div className="flex flex-col items-center mt-10">
                 <span className="text-gray-400 text-base">No results found for "{searchText}"</span>
               </div>
            )}
          </div>
        ) : (
          <>
            {/* Banner */}
            <Link to="/my-sales" className="bg-[#4CAF50] rounded-2xl p-4 flex items-center justify-center shadow-lg hover:bg-green-600 transition">
              <Eye className="w-5 h-5 text-white mr-2" />
              <span className="text-white font-bold text-base">See Your Products</span>
            </Link>

            {loading ? (
                 <div className="flex justify-center p-10">
                    <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
                 </div>
            ) : (
              <>
                {/* Top Items */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Top Items</h2>
                    <Link to="/listings?title=Top Items&sortType=top" className="text-sm text-primary-400 font-medium hover:underline">See All</Link>
                  </div>
                  <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                    {topItems.length > 0 ? (
                      topItems.map(item => <TopItemCard key={item.id} item={item} />)
                    ) : (
                      <p className="text-gray-500 italic text-sm">No items found.</p>
                    )}
                  </div>
                </section>

                {/* Categories */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Categories</h2>
                    <Link to="/buy" className="text-sm text-primary-400 font-medium hover:underline">See More</Link>
                  </div>
                  <div className="flex flex-wrap -mx-2">
                    {categories.length > 0 ? (
                      categories.slice(0, 8).map(cat => {
                        const IconComp = getIconComponent(cat.icon);
                        return (
                          <Link to={`/listings?title=${encodeURIComponent(cat.name)}&category=${encodeURIComponent(cat.name)}`} key={cat.id} className="w-1/4 px-2 mb-4 flex flex-col items-center hover:opacity-80 transition">
                            <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center mb-2 shadow-sm border border-white/5">
                              <IconComp className="w-6 h-6" style={{ color: cat.color || '#fff' }} />
                            </div>
                            <span className="text-[10px] text-gray-400 text-center">{cat.name}</span>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 italic text-sm w-full text-center">Loading categories...</p>
                    )}
                  </div>
                </section>

                {/* Recently Added */}
                <section>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Recently Added</h2>
                    <Link to="/listings?title=Recently Added&sortType=recent" className="text-sm text-primary-400 font-medium hover:underline">See All</Link>
                  </div>
                  <div className="flex flex-col">
                    {recentItems.length > 0 ? (
                       recentItems.map(item => <RecentItemCard key={item.id} item={item} />)
                    ) : (
                       <p className="text-gray-500 italic text-sm">No items found.</p>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
