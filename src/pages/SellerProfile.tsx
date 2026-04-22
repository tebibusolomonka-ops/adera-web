import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Star, BadgeCheck } from 'lucide-react';
import { getUserProfile } from '../services/user_service';
import type { UserProfile } from '../services/user_service';
import { getSellerReviews } from '../services/ReviewService';
import type { Review } from '../services/ReviewService';
import { getSellerListings } from '../services/listing_service';
import type { Listing } from '../services/listing_service';

const timeAgo = (dateInput: any) => {
    const timestamp = new Date(dateInput).getTime();
    if (isNaN(timestamp)) return "recently";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const getValidImageUrl = (url?: string) => {
  if (!url || url.startsWith('file://')) {
    return 'https://via.placeholder.com/150';
  }
  return url;
};

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

const SellerProfile = () => {
    const { sellerId } = useParams();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'items' | 'reviews'>('items');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [sellerItems, setSellerItems] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sellerId) return;
        setLoading(true);
        Promise.all([
            getUserProfile(sellerId),
            getSellerReviews(sellerId),
            getSellerListings(sellerId)
        ]).then(([userProfile, userReviews, userListings]) => {
            setProfile(userProfile);
            setReviews(userReviews || []);
            setSellerItems(userListings || []);
        }).catch(err => {
            console.error("Error fetching seller profile", err);
        }).finally(() => {
            setLoading(false);
        });
    }, [sellerId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20 relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 sticky top-0 bg-background z-20">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold text-white">Seller Profile</h1>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Profile Info Header */}
                <div className="bg-surface p-5 rounded-b-[20px] shadow-sm mb-4">
                    <div className="flex flex-row items-center mb-5">
                        <img 
                            src={profile?.photoURL || 'https://placehold.co/100?text=User'} 
                            alt={profile?.displayName || 'User'} 
                            className="w-20 h-20 rounded-full bg-gray-600 object-cover"
                        />
                        <div className="flex-1 ml-4">
                            <h2 className="text-[20px] font-bold text-white mb-1">
                                {profile?.displayName || 'Unknown User'}
                            </h2>
                            <div className="flex items-center mb-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-[14px] font-semibold text-white ml-1">
                                    {reviews.length > 0 ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) : 'New'}
                                </span>
                                <span className="text-[12px] text-gray-400 ml-1 block">
                                    ({reviews.length} reviews)
                                </span>
                            </div>
                            {profile?.isVerified && (
                                <div className="flex items-center mt-1">
                                    <BadgeCheck className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-[12px] font-bold text-green-500 ml-1">Verified Seller</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-row border-b border-white/10 mt-2">
                        <button 
                            className={`flex-1 py-3 text-center transition ${activeTab === 'items' ? 'border-b-2 border-[#764ba2] text-[#764ba2] font-bold' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('items')}
                        >
                            <span className="text-[16px]">Items</span>
                        </button>
                        <button 
                            className={`flex-1 py-3 text-center transition ${activeTab === 'reviews' ? 'border-b-2 border-[#764ba2] text-[#764ba2] font-bold' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            <span className="text-[16px]">Reviews</span>
                        </button>
                    </div>
                </div>

                {/* Tab Content Loop */}
                <div className="px-4">
                    {activeTab === 'items' ? (
                        sellerItems.length > 0 ? (
                            <div className="flex flex-col">
                                {sellerItems.map(item => (
                                    <RecentItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 flex justify-center">
                                <span className="text-gray-400">No items listed.</span>
                            </div>
                        )
                    ) : (
                        reviews.length > 0 ? (
                            <div className="flex flex-col">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-surface p-4 mb-3 rounded-xl shadow-sm border border-white/5">
                                        <div className="flex flex-row items-center mb-2">
                                            <img 
                                                src={review.buyerPhotoURL || 'https://placehold.co/100?text=Buyer'} 
                                                alt={review.buyerName || 'Buyer'} 
                                                className="w-8 h-8 rounded-full bg-gray-700 object-cover"
                                            />
                                            <div className="flex-1 ml-2.5">
                                                <div className="text-[14px] font-semibold text-white">{review.buyerName}</div>
                                                <div className="text-[11px] text-gray-400">{timeAgo(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt)}</div>
                                            </div>
                                            <div className="flex items-center bg-yellow-500/10 px-1.5 py-0.5 rounded">
                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                <span className="text-[12px] font-bold text-yellow-500 ml-1">{review.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-[14px] text-white leading-relaxed mt-1">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 flex justify-center">
                                <span className="text-gray-400">No reviews yet.</span>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerProfile;
