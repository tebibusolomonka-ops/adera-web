import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ShieldCheck, Zap } from 'lucide-react';
import { signInWithTelegram } from '../services/auth';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // *** THE FIX: Automatic Navigation ***
  // As soon as the user state becomes truthy, we navigate home.
  // This solves the "double click" bug because the page moves 
  // the instant Firebase recognizes the session.
  useEffect(() => {
    if (user) {
      console.log("User detected, navigating home...");
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleTelegramLogin = async () => {
    setError('');
    const tg = (window as any).Telegram?.WebApp;
    
    if (!tg || !tg.initData) {
      setError('Telegram not detected. Please open this app inside Telegram.');
      return;
    }

    setLoading(true);
    try {
      await signInWithTelegram(tg.initData);
      // We don't call navigate() here anymore; the useEffect above handles it!
    } catch (err: any) {
      console.error("Telegram Auth Error:", err);
      setError(err.message || 'Telegram authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 right-0 h-[50vh] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-[80px] shadow-2xl">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 relative z-10 pt-10 pb-20">
        
        {/* Logo/Icon Area */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
              <ShieldCheck className="w-10 h-10 text-white" />
           </div>
           <h1 className="text-4xl font-black text-white text-center tracking-tight leading-tight mb-2">
             Secure<br/>Access
           </h1>
           <p className="text-white/70 font-medium text-center max-w-[240px]">
             Experience one-tap secure authentication with Telegram.
           </p>
        </div>

        <div className="bg-surface rounded-[40px] p-8 shadow-2xl border border-white/5 w-full max-w-md mx-auto relative overflow-hidden transition-all duration-500">
           
           <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#667eea] via-[#e14fad] to-[#764ba2]"></div>

           {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm font-bold text-center animate-shake">
               {error}
             </div>
           )}

           <div className="space-y-8">
              <div className="space-y-2">
                 <h2 className="text-2xl font-bold text-white text-center">Identity Proof</h2>
                 <p className="text-gray-400 text-sm md:text-base text-center font-medium">
                    Automated, cryptographically verified login. No passwords, no SMS, zero friction.
                 </p>
              </div>

              <button 
                onClick={handleTelegramLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#24A1DE] to-[#24A1DE] hover:opacity-90 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-4 transition-all shadow-xl shadow-[#24A1DE]/20 disabled:opacity-50 group relative overflow-hidden active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></div>
                {loading ? (
                   <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-6 h-6 rotate-12 group-hover:rotate-0 transition-transform" />
                    <span className="tracking-widest uppercase">Continue with Telegram</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surfaceLight/50 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                    <Zap className="w-5 h-5 text-[#b18cff]" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Instant</span>
                 </div>
                 <div className="bg-surfaceLight/50 p-4 rounded-2xl flex flex-col items-center gap-2 border border-white/5">
                    <ShieldCheck className="w-5 h-5 text-[#2ecc71]" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Secure</span>
                 </div>
              </div>

              <p className="text-[11px] text-gray-500 text-center leading-relaxed font-medium px-4">
                 By continuing, you agree to our <span className="text-white cursor-pointer hover:underline">Terms of Service</span> and <span className="text-white cursor-pointer hover:underline">Privacy Policy</span>.
              </p>
           </div>

        </div>
      </div>
      
      <style>{`
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
           animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
