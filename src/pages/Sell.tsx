import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/user_service';

const SOCIAL_PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'Facebook', 'X (Twitter)', 'LinkedIn', 'Snapchat', 'Discord', 'Reddit', 'Pinterest', 'WhatsApp', 'Telegram', 'Other'];
const GAMES_LIST = ['PUBG Mobile', 'Free Fire', 'Call of Duty Mobile', 'Call of Duty Warzone', 'League of Legends', 'Valorant', 'Fortnite', 'Apex Legends', 'Mobile Legends', 'Other'];

const Sell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState<'social_media' | 'gaming' | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(profile => {
        if (profile?.verificationStatus !== 'approved') {
          navigate('/verification-required', { replace: true });
        } else {
          setIsCheckingAuth(false);
        }
      }).catch(err => {
        console.error(err);
        setIsCheckingAuth(false);
      });
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, navigate]);

  // Social Media State
  const [socialPlatform, setSocialPlatform] = useState('');
  const [socialUsername, setSocialUsername] = useState('');
  const [isMonetized, setIsMonetized] = useState<'yes' | 'no' | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [followers, setFollowers] = useState('');

  // Gaming State
  const [gameName, setGameName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [rank, setRank] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gamePrice, setGamePrice] = useState('');
  const [level, setLevel] = useState('');
  const [accountLevel, setAccountLevel] = useState('');
  const [playtime, setPlaytime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setError("You must be logged in to list an item.");
        return;
    }
    
    setError('');
    setLoading(true);

    try {
      const isSocial = category === 'social_media';
      const listingData: any = {
        category: isSocial ? 'social_media' : 'gaming',
        description: isSocial ? description : gameDescription,
        price,
        followers,
      };

      if (isSocial) {
          listingData.socialPlatform = socialPlatform;
          listingData.socialUsername = socialUsername;
          listingData.isMonetized = isMonetized;
      } else {
          listingData.gameName = gameName;
          listingData.accountId = accountId;
          listingData.level = level;
          listingData.accountLevel = accountLevel;
          listingData.rank = rank;
          listingData.playtime = playtime;
          listingData.price = gamePrice; // Ensure proper price field
      }

      // Instead of creating the listing here, navigate to the image upload screen 
      // where the actual listing creation happens.
      navigate('/upload-images', { state: { listingData } });
      
    } catch (err: any) {
        setError(err.message || 'Error configuring listing');
    } finally {
        setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
         <div className="w-8 h-8 border-4 border-[#764ba2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
      
      <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] pt-8 pb-10 px-6 rounded-b-[24px] shadow-lg shadow-primary-900/20">
        <div className="flex items-center">
          <Link to="/" className="text-white hover:text-gray-200 transition-colors mr-4 block">
            <ChevronLeft className="w-8 h-8" />
          </Link>
          <div className="flex-1">
            <h1 className="text-[22px] font-bold text-white mb-0.5">Sell an Account</h1>
            <p className="text-[13px] text-white/90">Enter details below to list your account for sale.</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6">
        <div className="bg-surface rounded-2xl p-6 shadow-xl border border-white/5">
          {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm font-medium animate-in fade-in">
               {error}
             </div>
          )}

          <h2 className="text-sm font-extrabold text-[#2D3748] tracking-wider uppercase text-white mb-1">Account Category</h2>
          <div className="h-1 w-10 bg-[#764ba2] rounded-full mb-6"></div>

          {/* Category Dropdown */}
          <div className="relative mb-6">
            <button 
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full flex justify-between items-center bg-surfaceLight border border-[#764ba2] rounded-xl px-4 py-3 text-white transition-colors hover:bg-surfaceLight/80"
            >
              <span className="font-semibold">
                {category === 'social_media' ? 'Social Media Account' : 
                 category === 'gaming' ? 'Gaming Account' : 'Select Account Type'}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surfaceLight border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                <button 
                  type="button"
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/5 border-b border-white/5 transition-colors"
                  onClick={() => { setCategory('social_media'); setIsCategoryDropdownOpen(false); }}
                >
                  Social Media Account
                </button>
                <button 
                  type="button"
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/5 transition-colors"
                  onClick={() => { setCategory('gaming'); setIsCategoryDropdownOpen(false); }}
                >
                  Gaming Account
                </button>
              </div>
            )}
          </div>

          {/* Helper Box */}
          <div className="flex gap-3 bg-[#F8F9FE] dark:bg-background border border-white/5 rounded-xl p-3 mb-6 items-center">
            <Package className="w-5 h-5 text-[#764ba2] shrink-0" />
            <p className="text-[13px] text-[#4A5568] dark:text-gray-400 font-semibold">Choose the appropriate category for your account to reach the right buyers.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {category === 'social_media' && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Social Platform</label>
                  <select 
                    value={socialPlatform} 
                    onChange={e => setSocialPlatform(e.target.value)}
                    className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select Platform</option>
                    {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Username / Handle</label>
                  <input type="text" value={socialUsername} onChange={e => setSocialUsername(e.target.value)} placeholder="@username" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-1 border-l-2 border-[#764ba2] pl-2">Monetization Status</label>
                  <p className="text-xs text-gray-400 mb-3 italic">Is this account currently monetized?</p>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setIsMonetized('yes')} className={`flex-1 py-2.5 rounded-lg border font-semibold transition-colors ${isMonetized === 'yes' ? 'bg-[#764ba2]/20 border-[#764ba2] text-[#b18cff]' : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'}`}>Monetized</button>
                    <button type="button" onClick={() => setIsMonetized('no')} className={`flex-1 py-2.5 rounded-lg border font-semibold transition-colors ${isMonetized === 'no' ? 'bg-[#764ba2]/20 border-[#764ba2] text-[#b18cff]' : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'}`}>Not Monetized</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">{socialPlatform === 'YouTube' ? 'Subscribers Count' : 'Followers Count'}</label>
                  <input type="number" value={followers} onChange={e => setFollowers(e.target.value)} placeholder="e.g. 10000" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the account, audience, niche..." rows={4} className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Price (ETB)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 500" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                  {price && !isNaN(Number(price)) && (
                    <p className="text-[#2ecc71] text-xs mt-1 font-medium italic">
                      Your item will be listed for {(Number(price) * 1.07).toFixed(2)} ETB (includes 7% platform fee).
                    </p>
                  )}
                </div>
              </div>
            )}

            {category === 'gaming' && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Game Name</label>
                  <select 
                    value={gameName} 
                    onChange={e => setGameName(e.target.value)}
                    className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors appearance-none"
                    required
                  >
                    <option value="" disabled>Select Game</option>
                    {GAMES_LIST.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Account ID</label>
                  <input type="text" value={accountId} onChange={e => setAccountId(e.target.value)} placeholder="e.g. 512345678" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Current Level</label>
                    <input type="number" value={level} onChange={e => setLevel(e.target.value)} placeholder="e.g. 50" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Account Level</label>
                    <input type="number" value={accountLevel} onChange={e => setAccountLevel(e.target.value)} placeholder="e.g. 150" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Rank</label>
                    <input type="text" value={rank} onChange={e => setRank(e.target.value)} placeholder="e.g. Ace" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Playtime (hrs)</label>
                    <input type="number" value={playtime} onChange={e => setPlaytime(e.target.value)} placeholder="e.g. 1200" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Description</label>
                  <textarea value={gameDescription} onChange={e => setGameDescription(e.target.value)} placeholder="List skins, rare items, battle pass stats..." rows={4} className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors resize-none" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2 border-l-2 border-[#764ba2] pl-2">Price (ETB)</label>
                  <input type="number" value={gamePrice} onChange={e => setGamePrice(e.target.value)} placeholder="e.g. 500" className="w-full bg-surfaceLight border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#764ba2] transition-colors" required />
                  {gamePrice && !isNaN(Number(gamePrice)) && (
                    <p className="text-[#2ecc71] text-xs mt-1 font-medium italic">
                      Your item will be listed for {(Number(gamePrice) * 1.07).toFixed(2)} ETB (includes 7% platform fee).
                    </p>
                  )}
                </div>
              </div>
            )}

            {category && (
              <button 
                type="submit" 
                disabled={loading || (category === 'social_media' && isMonetized === null)}
                className="mt-4 w-full bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#e14fad] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary-600/30 transition-shadow disabled:opacity-50 tracking-wide"
              >
                {loading ? 'Creating...' : 'CREATE LISTING'}
              </button>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default Sell;
