import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, Plus, Loader2 } from 'lucide-react';
import { createListing } from '../services/listing_service';
import type { Listing } from '../services/listing_service';
import { useAuth } from '../context/AuthContext';

type ImageItem = {
  dataUri: string;
};

const UploadImages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const listingData = location.state?.listingData;

  const [images, setImages] = useState<(ImageItem | null)[]>([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  if (!listingData) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Session Expired</h2>
        <p className="text-gray-400 mb-6">Please start the listing process again.</p>
        <button 
          onClick={() => navigate('/sell')}
          className="bg-[#667eea] text-white px-6 py-3 rounded-xl font-bold"
        >
          Back to Sell
        </button>
      </div>
    );
  }

  const handleImagePick = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Keep under 1MB for demo
          setError("Image too large. Please select a smaller image (< 1MB).");
          return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = { dataUri: reader.result as string };
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!images[0]) {
      setError('Main image is required');
      return;
    }
    setError('');
    setUploading(true);

    try {
      if (!user) throw new Error("Not logged in");

      // 1. Upload images to Cloudinary
      const validImages = images.filter((img: ImageItem | null): img is ImageItem => img !== null);
      
      const imageUrls: string[] = [];
      for(const image of validImages) {
          const remoteUrl = await uploadToCloudinary(image.dataUri);
          imageUrls.push(remoteUrl);
      }

      const priceValue = parseFloat(listingData.price);
      const categoryStr = listingData.category === 'social_media' 
        ? (listingData.socialPlatform || "Other") 
        : "Gaming";

      // Recreate exactly like mobile app
      const sanitize = <T extends object>(obj: T): T => {
        return JSON.parse(JSON.stringify(obj, (_, v) => v === undefined ? null : v));
      };

      const newListingRaw: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviews'> = {
        title: listingData.category === 'social_media' 
            ? `${listingData.socialPlatform || 'Social'} Account`
            : `${listingData.gameName || 'Game'} Account`,
        description: listingData.description || "",
        category: categoryStr,
        image_url: imageUrls[0], 
        additionalImages: imageUrls, 
        sellerId: user.uid,
        status: 'pending',
        price: isNaN(priceValue) ? 0 : priceValue * 1.07,
        basePrice: isNaN(priceValue) ? 0 : priceValue,
        platformFee: isNaN(priceValue) ? 0 : priceValue * 0.07,
        
        socialPlatform: listingData.socialPlatform || null,
        socialUsername: listingData.socialUsername || null,
        isMonetized: listingData.isMonetized || null,
        gameName: listingData.gameName || null,
        rank: listingData.rank || null,
        level: listingData.level ? parseInt(listingData.level) : undefined,
        accountLevel: listingData.accountLevel || null,
        playtime: listingData.playtime || null,
        follower_count: listingData.followers ? parseInt(listingData.followers) : 0,
        views: 0,
        likes: 0
      };

      const newListing = sanitize(newListingRaw);

      await createListing(newListing);
      
      // Navigate to Home like mobile
      navigate('/');
    } catch (err: any) {
      console.error("Publish Error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F8FA] dark:bg-background relative">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] flex items-center justify-between px-5 pt-10 pb-5 rounded-b-[20px] shadow-md z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition text-white">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <h1 className="text-lg font-bold text-white">Upload Photos</h1>
        <div className="w-9" />
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl mb-4 text-sm font-medium">
               {error}
            </div>
        )}

        <div className="mb-5">
           <h2 className="text-xl font-bold text-[#2D3748] dark:text-white mb-1">Add Visuals</h2>
           <p className="text-[14px] text-[#718096] dark:text-gray-400 leading-snug">
               Upload clear screenshots of your account stats, dashboard, and inventory.
           </p>
        </div>

        {/* Grid Container */}
        <div className="mb-8">
            {/* Main Image (Large) */}
            <div 
                onClick={() => !uploading && fileInputRefs[0].current?.click()}
                className="w-full h-[220px] bg-white dark:bg-surface rounded-2xl border border-dashed border-[#E2E8F0] dark:border-white/20 overflow-hidden mb-4 cursor-pointer hover:opacity-90 transition relative flex items-center justify-center"
            >
                {images[0] ? (
                    <img src={images[0].dataUri} alt="Main" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center">
                        <Camera className="w-10 h-10 text-[#667eea] mb-2" />
                        <span className="text-[14px] font-semibold text-[#667eea]">Main Photo *</span>
                    </div>
                )}
                <input type="file" ref={fileInputRefs[0]} onChange={(e) => handleImagePick(0, e)} accept="image/*" className="hidden" />
            </div>

            {/* Sub Images (Row) */}
            <div className="flex justify-between gap-4">
                {[1, 2].map((idx) => (
                    <div 
                        key={idx}
                        onClick={() => !uploading && fileInputRefs[idx].current?.click()}
                        className="flex-1 h-[140px] bg-white dark:bg-surface rounded-2xl border border-dashed border-[#E2E8F0] dark:border-white/20 overflow-hidden cursor-pointer hover:opacity-90 transition relative flex items-center justify-center"
                    >
                        {images[idx] ? (
                            <img src={images[idx]!.dataUri} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Plus className="w-6 h-6 text-[#A0AEC0] mb-1" />
                                <span className="text-[12px] font-medium text-[#A0AEC0]">Add More</span>
                            </div>
                        )}
                        <input type="file" ref={fileInputRefs[idx]} onChange={(e) => handleImagePick(idx, e)} accept="image/*" className="hidden" />
                    </div>
                ))}
            </div>
        </div>

        {/* Publish Button */}
        <button 
            onClick={handlePublish}
            disabled={uploading}
            className="w-full rounded-2xl shadow-lg shadow-[#FE4A65]/30 overflow-hidden disabled:opacity-70 transition-opacity mt-5 hover:scale-[1.02] active:scale-95 duration-200"
        >
            <div className="bg-gradient-to-r from-[#FF80A8] to-[#FE4A65] py-[18px] flex items-center justify-center">
                {uploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                    <span className="text-white text-[16px] font-bold tracking-[1px]">PUBLISH LISTING</span>
                )}
            </div>
        </button>
      </div>

      {/* Loading Overlay */}
      {uploading && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-surface p-6 rounded-2xl flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin"></div>
                <span className="mt-4 text-[14px] font-semibold text-[#2D3748] dark:text-white">Uploading Images...</span>
            </div>
        </div>
      )}

    </div>
  );
};

export default UploadImages;
