import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Share2, AlertCircle, Star, X, Images, ChevronRight } from 'lucide-react';
import { getListing } from '../services/listing_service';
import type { Listing } from '../services/listing_service';
import { getUserProfile } from '../services/user_service';

// Formatter for Stats
const formatStat = (num: number | string | undefined) => {
  if (!num) return '0';
  const n = Number(num);
  if (isNaN(n)) return num.toString();
  
  if (n >= 1000000) {
    return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 1000) {
    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return n.toLocaleString(); 
};

// Formatter for Price
const formatPrice = (num: number | string | undefined) => {
    if (!num) return '0.00';
    const n = Number(num);
    if (isNaN(n)) return num.toString();
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const itemFromState = location.state?.item;

  const [activeSlide, setActiveSlide] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [fetchedItem, setFetchedItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLightboxVisible, setLightboxVisible] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<any>(null);

  useEffect(() => {
    if (!itemFromState && id) {
        setLoading(true);
        getListing(id)
          .then(data => {
            if (data) setFetchedItem(data);
            setLoading(false);
          })
          .catch(err => {
             console.error("Error fetching item detail:", err);
             setLoading(false);
          });
    }
  }, [itemFromState, id]);

  const data: any = itemFromState || fetchedItem || {};

  useEffect(() => {
      if (data.sellerId) {
          getUserProfile(data.sellerId).then(profile => {
              if (profile) setSellerProfile(profile);
          });
      }
  }, [data.sellerId]);

  if (loading || (!itemFromState && !fetchedItem && !loading)) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background text-white">
              {loading ? (
                <div className="w-8 h-8 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                 <div className="flex flex-col items-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <span>Item not found</span>
                    <button onClick={() => navigate(-1)} className="mt-4 text-[#667eea]">Go Back</button>
                 </div>
              )}
          </div>
      );
  }

  // 1. ROBUST IMAGE HANDLING
  let images: string[] = [];
  if (data.additionalImages && Array.isArray(data.additionalImages) && data.additionalImages.length > 0) {
      images = data.additionalImages;
  } else if (data.imageUrl || data.image_url) {
      images = [data.imageUrl || data.image_url];
  } else {
      images = ['https://placehold.co/600x400/eeeeee/333333?text=No+Image'];
  }

  const handleShare = async () => {
     try {
         const shareData = {
             title: data.title,
             text: `Check out ${data.title} for ${formatPrice(data.price)} br on Adera!`,
             url: window.location.href
         };
         if (navigator.share) {
             await navigator.share(shareData);
         } else {
             navigator.clipboard.writeText(window.location.href);
             alert("Link copied to clipboard!");
         }
     } catch (err) {
         console.error(err);
     }
  };

  const socialPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Telegram', 'Social Media', 'social_media'];
  const isSocial = socialPlatforms.includes(data.category) || !!data.socialPlatform;
  const isUnavailable = data.status === 'payment_pending' || data.status === 'sold';

  const handleBuy = async () => {
      if (data.status === 'payment_pending') {
          alert("This item is currently being processed by another buyer.");
          return;
      }
      if (data.status === 'sold') {
          alert("This item has already been sold.");
          return;
      }

      try {
          const freshItem = await getListing(data.id);
          if (freshItem?.status === 'payment_pending') {
              alert("Someone else is currently buying this item.");
              return;
          }
          if (freshItem?.status === 'sold') {
              alert("This item is no longer available.");
              return;
          }
          // Assuming payment route takes state
          navigate('/payment', { state: { item: data } });
      } catch (e) {
          console.error("Error checking status", e);
          alert("Could not verify item status. Please check your connection.");
      }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-32">
      {/* HEADER */}
      <div className="sticky top-0 left-0 right-0 bg-[#667eea] z-40 shadow-sm pt-2 md:pt-4">
         <div className="flex flex-row items-center justify-between px-5 h-[60px]">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
              <ChevronLeft className="w-7 h-7 text-white" />
            </button>
            <span className="text-white text-[18px] font-semibold">Item Details</span>
            <button onClick={handleShare} className="p-2 -mr-2 rounded-full hover:bg-white/10 transition">
               <Share2 className="w-6 h-6 text-white" />
            </button>
         </div>
      </div>

      <div className="relative z-10 w-full">
        {/* BLUE BACKGROUND DECORATION */}
        <div className="absolute top-0 left-0 right-0 h-[200px] bg-[#667eea] rounded-b-[40px] -z-10" />

        {/* IMAGE SLIDER */}
        <div className="flex flex-col items-center mb-5 mt-4 relative">
           <div className="w-[calc(100%-40px)] h-[240px] rounded-[24px] bg-surface shadow-xl overflow-hidden relative group">
               <div 
                  className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full cursor-pointer"
                  onScroll={(e) => {
                      const scrollLeft = e.currentTarget.scrollLeft;
                      const width = e.currentTarget.clientWidth;
                      const slide = Math.round(scrollLeft / width);
                      if (slide !== activeSlide && slide >= 0 && slide < images.length) {
                          setActiveSlide(slide);
                      }
                  }}
               >
                  {images.map((img: string, index: number) => (
                      <div 
                        key={index} 
                        className="w-full h-full flex-shrink-0 snap-start"
                        onClick={() => {
                            setActiveSlide(index);
                            setLightboxVisible(true);
                        }}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="Item" />
                      </div>
                  ))}
              </div>
              
              {/* Pagination Dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-1.5 pointer-events-none">
                  {images.map((_, i) => (
                      <div 
                          key={i} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${i === activeSlide ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} 
                      />
                  ))}
              </div>

              {/* Image Counter Badge */}
              {images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 px-2.5 py-1.5 rounded-xl flex items-center shadow-md">
                      <Images className="w-3 h-3 text-white mr-1.5" />
                      <span className="text-white text-xs font-semibold">{activeSlide + 1} / {images.length}</span>
                  </div>
              )}
           </div>
        </div>

        {/* LIGHTBOX MODAL */}
        {isLightboxVisible && (
            <div className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-center items-center backdrop-blur-sm">
                <button 
                    onClick={() => setLightboxVisible(false)} 
                    className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition group"
                >
                    <X className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                </button>
                
                <div className="w-full h-[70vh] flex items-center justify-center select-none" onClick={() => setLightboxVisible(false)}>
                    <img 
                        src={images[activeSlide]} 
                        className="max-w-full max-h-full object-contain drop-shadow-2xl" 
                        alt="Enlarged Item" 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                
                <span className="text-white text-base font-semibold mt-6 opacity-80 shadow-md">
                    {activeSlide + 1} of {images.length}
                </span>
            </div>
        )}

        {/* Content Body */}
        <div className="px-[25px] mt-2.5">
            {/* Title */}
            <h1 className="text-[24px] font-bold text-white mb-5 leading-tight">{data.title}</h1>

            {/* Seller Info */}
            <div 
                onClick={() => navigate(`/seller/${data.sellerId}`)}
                className="flex flex-row items-center bg-surface p-3 rounded-2xl mb-6 shadow-sm cursor-pointer hover:bg-white/5 transition border border-white/5"
            >
                <img 
                    src={sellerProfile?.photoURL || 'https://placehold.co/100?text=Seller'} 
                    className="w-11 h-11 rounded-full object-cover bg-surfaceLight" 
                    alt="Seller Avatar" 
                />
                <div className="flex-1 ml-3">
                    <span className="text-[11px] text-gray-400 block mb-0.5 tracking-wide uppercase">Seller ID</span>
                    <span className="text-[15px] font-semibold text-white truncate block">
                        {sellerProfile?.numericId ? `#${sellerProfile.numericId}` : (data.sellerId ? `User_${data.sellerId.substring(0,6)}` : 'Unknown')}
                    </span>
                </div>
                <div className="flex items-center bg-yellow-500/10 px-2.5 py-1.5 rounded-lg border border-yellow-500/20">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    <span className="ml-1 text-[12px] font-bold text-yellow-500">
                        {sellerProfile?.rating ? 
                            `${sellerProfile.rating.toFixed(1)} (${sellerProfile.ratingCount || 0})` 
                            : 'New'}
                    </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
            </div>

            <div className="h-px bg-white/10 mb-6" />

            {/* Stats Grid */}
            <h2 className="text-[18px] font-bold text-white mb-4">
                {isSocial ? "Account Details" : "Game Details"}
            </h2>
            
            <div className="flex flex-row flex-wrap justify-between gap-[12px] mb-6">
                 {isSocial ? (
                     <>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Platform</span>
                            <span className="text-[15px] font-semibold text-white block">{data.socialPlatform || data.category || 'N/A'}</span>
                        </div>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">
                                {(data.socialPlatform === 'YouTube' || data.category === 'YouTube') ? "Subscribers" : "Followers"}
                            </span>
                            <span className="text-[15px] font-semibold text-white block">{formatStat(data.follower_count)}</span>
                        </div>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Monetized</span>
                            <span className={`text-[15px] font-semibold block ${data.isMonetized === 'yes' ? 'text-green-500' : 'text-gray-400'}`}>
                                {data.isMonetized === 'yes' ? `✅ Yes` : "No"}
                            </span>
                        </div>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Username</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.socialUsername || "Hidden"}</span>
                        </div>
                     </>
                 ) : (
                     <>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Game</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.gameName || 'N/A'}</span>
                        </div>
                         <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Current Level</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.level || 'N/A'}</span>
                        </div>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Account Level</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.accountLevel || 'N/A'}</span>
                        </div>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Playtime</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.playtime ? `${data.playtime} Hrs` : 'N/A'}</span>
                        </div>
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">Rank</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.rank || 'N/A'}</span>
                        </div> 
                        <div className="w-[calc(50%-6px)] bg-surface p-4 rounded-2xl shadow-sm border border-white/5">
                            <span className="text-[12px] text-gray-400 block mb-1">ID</span>
                            <span className="text-[15px] font-semibold text-white block truncate">{data.accountId || "Hidden"}</span>
                        </div>
                     </>
                 )}
            </div>

            {/* Description */}
            <h2 className="text-[18px] font-bold text-white mb-3">Description</h2>
            <p className={`text-[15px] text-gray-400 leading-[24px] ${!descriptionExpanded && 'line-clamp-3'}`}>
                {data.description || 'This is a premium account with rare items, high stats, and excellent reputation. Perfect for immediate use.'}
            </p>
            <button 
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="text-[#667eea] text-[14px] mt-2 font-semibold hover:text-indigo-400 transition"
            >
                {descriptionExpanded ? "Show Less" : "Read More"}
            </button>

        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md flex flex-row items-center justify-between px-[25px] py-[15px] md:pb-[20px] rounded-t-[24px] border-t border-white/5 shadow-[0_-4px_10px_rgba(0,0,0,0.2)] z-50">
          <div className="flex-1">
              <span className="text-[12px] text-gray-400 block mb-0.5">Total Price</span>
              <div className="text-[22px] font-bold text-white leading-none">
                  {formatPrice(data.price)} <span className="text-[14px] font-semibold text-[#667eea]">br</span>
              </div>
          </div>
          
          <div className="flex-1 ml-5">
              <button 
                 disabled={isUnavailable}
                 onClick={handleBuy}
                 className={`w-full h-[56px] rounded-full flex items-center justify-center transition shadow-[0_8px_16px_rgba(255,107,107,0.2)]
                    ${isUnavailable ? 'bg-gray-500 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] hover:opacity-90'}
                 `}
              >
                 <span className="text-white text-[18px] font-bold tracking-wide">
                     {data.status === 'payment_pending' ? "Processing" : (data.status === 'sold' ? "Sold Out" : "Buy Now")}
                 </span>
              </button>
          </div>
      </div>

    </div>
  );
};

export default ItemDetail;
