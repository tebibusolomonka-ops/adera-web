import { useEffect, useState, useRef } from 'react';
import { ChevronRight, Star, Pencil } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/user_service';
import type { UserProfile } from '../services/user_service';
import { getSellerReviews } from '../services/ReviewService';
import type { Review } from '../services/ReviewService';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(data => {
        setProfileData(data);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching profile", err);
        setLoading(false);
      });

      getSellerReviews(user.uid).then(data => {
        setReviews(data);
      }).catch(console.error);
    } else {
        setLoading(false);
    }
  }, [user]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 700000) {
        alert("Image Too Large. Please use a smaller image under 700KB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Image = event.target?.result as string;
        if (user && base64Image) {
          try {
            await updateUserProfile(user.uid, { photoURL: base64Image });
            setProfileData(prev => prev ? { ...prev, photoURL: base64Image } : null);
          } catch (error) {
            console.error('Failed to update profile pic', error);
            alert("Failed to update profile picture.");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    try {
      if (logout) {
          await logout();
      }
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // STRICT: Only admin-approved users (verificationStatus === 'approved') get access
  const isUserVerified = profileData?.verificationStatus === 'approved';

  const MENU_ITEMS = [
    {
      title: 'Activities',
      data: [
        { 
          id: '1', 
          title: 'Sell', 
          icon: 'PlusCircle', 
          action: () => {
            if (isUserVerified) {
              navigate('/my-sales');
            } else {
              navigate('/verification-required');
            }
          } 
        },
        { 
          id: '2', 
          title: 'Buy', 
          icon: 'ShoppingCart', 
          action: () => navigate('/my-purchases')
        },
        { id: '3', title: 'Verify', icon: 'CheckCircle', action: () => navigate('/verify') },
      ],
    },
    {
      title: 'General',
      data: [
        { 
          id: '4', 
          title: 'Edit Profile', 
          icon: 'User', 
          action: () => {
            if (profileData?.isVerified) {
              navigate('/edit-profile');
            } else {
              navigate('/edit-profile-verification-required');
            }
          } 
        },
        { id: '5', title: 'Settings', icon: 'Settings', action: () => navigate('/settings') },
        { id: '6', title: 'Contact Us', icon: 'Mail', action: () => navigate('/contact-us') },
        { id: '7', title: 'Logout', icon: 'LogOut', color: '#E53E3E', action: handleLogout },
      ],
    },
  ];

  const renderMenuItem = (item: any, isLast: boolean) => {
    const IconComp = (LucideIcons as any)[item.icon] || LucideIcons.HelpCircle;
    return (
    <div key={item.id} onClick={item.action} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors ${!isLast ? 'border-b border-white/5' : ''}`}>
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: item.color ? '#422020' : 'var(--color-surfaceLight)' }}>
            <IconComp className="w-5 h-5" style={{ color: item.color || '#b18cff' }} />
          </div>
          <span className="font-semibold" style={{ color: item.color || 'var(--color-textPrimary)' }}>{item.title}</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </div>
    );
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-background">
              <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      {/* Tall Header Gradient */}
      <div className="relative h-64 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-[40px] overflow-hidden">
        <div className="absolute top-6 left-4 z-10">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-full transition">
            <LucideIcons.ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-xl"></div>
      </div>

      <div className="px-5 -mt-24 space-y-6">
        
        {/* Floating Profile Card */}
        <div className="bg-surface rounded-3xl p-6 shadow-[0_10px_30px_rgba(102,126,234,0.15)] flex flex-col items-center border border-white/5">
          <div className="relative mb-4">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleProfileImageChange}
            />
            {(profileData?.photoURL || user?.photoURL) ? (
              <img 
                src={profileData?.photoURL || user?.photoURL || 'https://via.placeholder.com/150'} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full border-4 border-surface shadow-lg object-cover" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-surface shadow-lg bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {(profileData?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#2D3748] border-2 border-surface rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">{profileData?.displayName || user?.displayName || 'User'}</h2>
          <p className="text-sm font-medium text-gray-400 mb-3">{user?.email}</p>
          
          <div className="flex items-center bg-surfaceLight border border-white/5 px-3 py-1.5 rounded-xl mb-5">
            <span className="text-xs font-mono text-gray-400 font-semibold tracking-wide">ID: {user?.uid.substring(0, 10)}...</span>
          </div>

          <div className="flex w-full justify-around pt-5 border-t border-white/10">
            <div className="flex flex-col items-center">
              <div className="flex items-center">
                <span className="text-lg font-bold text-white mr-1">{profileData?.ratingCount ? '4.8' : '0.0'}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>
              <span className="text-xs font-semibold text-gray-500 mt-1">{profileData?.ratingCount || 0} Ratings</span>
            </div>
          </div>
        </div>

        {/* Menus */}
        {MENU_ITEMS.map(section => (
          <div key={section.title} className="mb-5">
            <h3 className="text-xs font-extrabold text-[#764ba2] uppercase tracking-wide mb-3 ml-2">{section.title}</h3>
            <div className="bg-surface rounded-2xl shadow-sm border border-white/5 overflow-hidden">
              {section.data.map((item, index) => renderMenuItem(item, index === section.data.length - 1))}
            </div>
          </div>
        ))}
        
        {/* REVIEWS SECTION */}
        <div className="mb-5">
          <h3 className="text-xs font-extrabold text-[#764ba2] uppercase tracking-wide mb-3 ml-2">Recent Reviews</h3>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="bg-surface rounded-2xl p-4 shadow-sm border border-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <img 
                        src={review.buyerPhotoURL || 'https://via.placeholder.com/40'} 
                        alt={review.buyerName} 
                        className="w-8 h-8 rounded-full mr-3 object-cover"
                      />
                      <div>
                        <div className="text-sm font-bold text-white mb-0.5">{review.buyerName}</div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <div className="text-sm italic text-gray-400 mt-2">
                      "{review.comment}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center text-gray-400 text-sm mt-4 mb-4">No reviews yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
