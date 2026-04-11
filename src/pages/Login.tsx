import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn } from '../services/auth';

const Login = () => {
  const getErrorMessage = (err: any): string => {
    const code = err?.code || '';
    const map: Record<string, string> = {
      'auth/network-request-failed': 'Connection lost. Please check your internet and try again.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/user-disabled': 'This account has been disabled. Contact support.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-[60px] transform -translate-y-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pt-10 pb-20">
        
        <div className="mb-10 w-full">
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome<br/>Back!</h1>
           <p className="text-white/80 font-medium">Log in to continue trading securely.</p>
        </div>

        <div className="bg-surface rounded-3xl p-6 shadow-2xl border border-white/5 w-full max-w-md mx-auto relative overflow-hidden">
           
           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#667eea] to-[#e14fad]"></div>

           {error && (
             <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm font-medium animate-in fade-in">
               {error}
             </div>
           )}

           <form onSubmit={handleLogin} className="flex flex-col gap-5">
             
             <div>
               <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Email Address</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Mail className="h-5 w-5 text-gray-500" />
                 </div>
                 <input 
                   type="email" 
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full bg-surfaceLight border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-white outline-none focus:border-[#764ba2] transition-colors focus:ring-1 focus:ring-[#764ba2] placeholder-gray-600"
                   placeholder="Enter your email"
                   required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Password</label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-gray-500" />
                 </div>
                 <input 
                   type={showPassword ? 'text' : 'password'}
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-surfaceLight border border-white/10 rounded-xl pl-11 pr-12 py-3.5 text-white outline-none focus:border-[#764ba2] transition-colors focus:ring-1 focus:ring-[#764ba2] placeholder-gray-600"
                   placeholder="Enter your password"
                   required
                 />
                 <button 
                   type="button" 
                   className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                   onClick={() => setShowPassword(!showPassword)}
                 >
                   {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                 </button>
               </div>
               <div className="flex justify-end mt-2">
                 <button type="button" className="text-sm font-semibold text-[#b18cff] hover:text-white transition-colors">
                   Forgot Password?
                 </button>
               </div>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="mt-4 w-full bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#e14fad] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-primary-600/30 transition-shadow disabled:opacity-50 tracking-wide"
             >
               {loading ? 'LOGGING IN...' : 'LOG IN'}
             </button>

           </form>

           <div className="mt-8 flex items-center justify-center gap-2">
              <span className="text-gray-400 font-medium">Don't have an account?</span>
              <Link to="/signup" className="text-[#b18cff] font-bold hover:text-white transition-colors">
                Sign Up
              </Link>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
