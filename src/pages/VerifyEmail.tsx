import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../services/auth';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // If user is already verified, redirect to home
  useEffect(() => {
    if (user?.emailVerified) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    setResent(false);
    try {
      await resendVerificationEmail();
      setResent(true);
      setCooldown(60); // 60 second cooldown
    } catch (err: any) {
      alert(err.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await refreshUser();
      // After refresh, check again
      const auth = (await import('firebase/auth')).getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          navigate('/', { replace: true });
          return;
        }
      }
      alert('Email not verified yet. Please check your inbox and click the verification link.');
    } catch (err) {
      console.error(err);
      alert('Failed to check verification status.');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-[60px] transform -translate-y-10 shadow-2xl">
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-6 relative z-10">
        
        <div className="bg-surface rounded-3xl p-8 shadow-2xl border border-white/5 w-full max-w-md text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#e14fad]"></div>

          {/* Email Icon */}
          <div className="w-24 h-24 rounded-full bg-[#667eea]/15 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-[#667eea]" />
          </div>

          <h1 className="text-[24px] font-extrabold text-white mb-3">Verify Your Email</h1>
          
          <p className="text-[14px] text-gray-400 leading-relaxed mb-2">
            We've sent a verification link to
          </p>
          <p className="text-[15px] font-bold text-[#667eea] mb-6 break-all">
            {user?.email || 'your email'}
          </p>
          
          <p className="text-[13px] text-gray-500 leading-relaxed mb-8">
            Please check your inbox (and spam folder) and click the verification link. Once verified, click the button below to continue.
          </p>

          {/* Check Verification Button */}
          <button
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full py-3.5 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition shadow-lg shadow-[#667eea]/20 mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {checking ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                I've Verified My Email
              </>
            )}
          </button>

          {/* Resend */}
          <button
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="w-full py-3 border border-white/10 rounded-xl text-gray-300 font-semibold text-[14px] hover:bg-white/5 transition mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
          </button>

          {resent && (
            <div className="bg-[#48BB78]/10 border border-[#48BB78]/20 text-[#48BB78] p-3 rounded-xl text-sm font-medium mb-4 animate-in fade-in">
              ✓ Verification email sent! Check your inbox.
            </div>
          )}

          {/* Sign out link */}
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 text-[13px] font-medium transition flex items-center justify-center gap-1.5 mx-auto mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out & use a different email
          </button>

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
