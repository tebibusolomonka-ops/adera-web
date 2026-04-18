import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ShieldCheck, Zap } from 'lucide-react';
import { signInWithTelegram } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log("Session active, entering marketplace...");
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleTelegramLogin = async () => {
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
    <div className="flex flex-col min-h-screen bg-background pb-10">
      
      {/* Signature Adera Gradient Header */}
      <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] pt-12 pb-24 px-8 rounded-b-[40px] shadow-lg shadow-primary-900/20 text-center relative overflow-hidden">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 animate-in fade-in duration-700">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20 shadow-xl">
              <ShieldCheck className="w-10 h-10 text-white" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Adera Gateway</h1>
           <p className="text-white/80 text-sm font-medium">Your Secure Entry to Digital Trading</p>
        </div>
      </div>

      <div className="px-6 -mt-12 max-w-lg mx-auto w-full">
        <div className="bg-surface rounded-3xl p-8 shadow-2xl border border-white/5 relative">
          
          {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 text-sm font-bold text-center">
               {error}
             </div>
          )}

          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-xl font-extrabold text-white">Identity Verification</h2>
              <p className="text-gray-400 text-[14px] leading-relaxed font-medium">
                To keep our marketplace safe, we use **Telegram Native ID**. 
                This ensures every buyer and seller is a real person.
              </p>
            </div>

            <button 
              onClick={handleTelegramLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:shadow-lg hover:shadow-[#667eea]/20 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                 <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-5 h-5 text-white" />
                  <span className="tracking-wide text-[16px]">ENTER MARKETPLACE</span>
                </>
              )}
            </button>

            {/* Feature Badges - Match Home Page Category Style */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-surfaceLight p-4 rounded-xl flex items-center gap-3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-[#b18cff]/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-[#b18cff]" />
                  </div>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Instant</span>
               </div>
               <div className="bg-surfaceLight p-4 rounded-xl flex items-center gap-3 border border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Verified</span>
               </div>
            </div>

            <div className="pt-4 text-center">
               <p className="text-[12px] text-gray-500 font-medium leading-relaxed italic">
                 "Trade with confidence. Encrypted by Telegram."
               </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;

