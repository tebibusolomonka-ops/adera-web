import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Send, ShieldCheck, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { signInWithTelegram } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleTelegramLogin = async () => {
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy first.');
      return;
    }

    setError('');
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg || !tg.initData) {
      setError('Telegram not detected. Please open Adera inside the Telegram App.');
      return;
    }

    setLoading(true);
    try {
      await signInWithTelegram(tg.initData);
    } catch (err: any) {
      console.error("Auth Exception:", err);
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#06060C] relative overflow-hidden font-sans">
      
      {/* --- PREMIUN FANCY BACKGROUND --- */}
      {/* Animated Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#667eea] opacity-20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#764ba2] opacity-20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[30%] right-[-5%] w-[30%] h-[30%] bg-[#e14fad] opacity-10 blur-[100px] rounded-full"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10 pt-10 pb-20">
        
        {/* Logo/Identity Section */}
        <div className="flex flex-col items-center mb-10 animate-in fade-in slide-in-from-top-6 duration-1000">
           <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[32px] flex items-center justify-center shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-[#24A1DE]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <Send className="w-12 h-12 text-white transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500" />
              </div>
           </div>
           
           <div className="mt-8 text-center">
              <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2">
                 ADERA
              </h1>
              <div className="flex items-center justify-center gap-2">
                 <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-white/20"></span>
                 <p className="text-[12px] font-black text-white/40 tracking-[0.3em] uppercase">Digital Marketplace</p>
                 <span className="h-[2px] w-8 bg-gradient-to-l from-transparent to-white/20"></span>
              </div>
           </div>
        </div>

        {/* --- THE FANCY GLASS CARD --- */}
        <div className="w-full max-w-md group transition-all duration-500">
          <div className="relative bg-white/[0.03] backdrop-blur-[40px] rounded-[48px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
             
             {/* Glow effect at top */}
             <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
             
             {error && (
               <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-2xl mb-8 text-xs font-bold text-center animate-in zoom-in duration-300">
                 {error}
               </div>
             )}

             <div className="space-y-10">
                <div className="space-y-4 text-center">
                   <h2 className="text-2xl font-black text-white tracking-tight uppercase">Enter Marketplace</h2>
                   <p className="text-gray-400 text-sm font-medium leading-relaxed px-2">
                      Trade Social Media Accounts, Gaming IDs, and Digital Assets with verified security.
                   </p>
                </div>

                <div className="space-y-6">
                   {/* --- TERMS & PRIVACY CHECKBOX --- */}
                   <label className="flex items-start gap-3 cursor-pointer group/check">
                      <div className="relative mt-1">
                         <input 
                            type="checkbox" 
                            checked={agreed}
                            onChange={() => setAgreed(!agreed)}
                            className="peer sr-only"
                         />
                         <div className="w-5 h-5 border-2 border-white/20 rounded-md transition-all peer-checked:bg-[#24A1DE] peer-checked:border-[#24A1DE] flex items-center justify-center">
                            <CheckCircle2 className={`w-4 h-4 text-white transition-opacity ${agreed ? 'opacity-100' : 'opacity-0'}`} />
                         </div>
                      </div>
                      <span className="text-[12px] text-gray-400 font-semibold leading-relaxed">
                         I agree to the <Link to="/terms-of-service" className="text-white hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-white hover:underline">Privacy Policy</Link>.
                      </span>
                   </label>

                   <button 
                      onClick={handleTelegramLogin}
                      disabled={loading}
                      className={`relative w-full py-6 rounded-3xl font-black text-sm tracking-[0.1em] uppercase overflow-hidden transition-all duration-300 
                        ${agreed ? 'bg-[#24A1DE] text-white shadow-[0_10px_30px_rgba(36,161,222,0.3)] active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'}
                      `}
                   >
                      <div className="relative z-10 flex items-center justify-center gap-3">
                         {loading ? (
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                         ) : (
                            <>
                               <span>Sign In With Telegram</span>
                               <Send className="w-4 h-4 ml-1" />
                            </>
                         )}
                      </div>
                      {/* Button Sparkle Effect */}
                      {agreed && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-shimmer"></div>}
                   </button>
                </div>

                {/* Micro Icons */}
                <div className="grid grid-cols-4 gap-4 border-t border-white/5 pt-8">
                   {[
                      { icon: Lock, label: 'AES-256' },
                      { icon: ShieldCheck, label: 'Secure' },
                      { icon: Zap, label: 'Instant' },
                      { icon: ShieldCheck, label: 'Verified' }
                   ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                         <item.icon className="w-5 h-5 text-white/40" />
                         <span className="text-[9px] font-black text-white/20 tracking-tighter uppercase">{item.label}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Legal Footer */}
        <div className="mt-12 text-center text-[10px] text-white/20 font-bold tracking-widest uppercase">
           Adera Marketplace © 2026 | encrypted gateway
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Login;


