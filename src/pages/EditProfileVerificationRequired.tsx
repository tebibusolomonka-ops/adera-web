import { User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditProfileVerificationRequired = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="fixed inset-x-0 h-64 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-[40px] shadow-lg -z-0">
                <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/10" />
                <div className="absolute bottom-10 -right-5 w-36 h-36 rounded-full bg-white/10" />
            </div>

            <div className="flex flex-col items-center justify-center flex-1 px-5 mt-20 z-10 w-full max-w-md mx-auto">
                <div className="bg-surface rounded-3xl p-8 w-full flex flex-col items-center shadow-xl border border-white/5 mx-5 relative">
                    <div className="w-24 h-24 rounded-full bg-[#1e293b] flex items-center justify-center mb-6 border-4 border-[#764ba2]/50 shadow-[0_0_15px_rgba(118,75,162,0.5)] relative">
                        <User className="w-14 h-14 text-[#764ba2]" />
                        <div className="absolute bottom-0 right-0 bg-red-500 w-7 h-7 rounded-full flex items-center justify-center border-2 border-surface">
                            <Lock className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-white mb-3 text-center">Identity Verification</h2>
                    
                    <p className="text-[#a0aec0] text-center mb-2 leading-relaxed">
                        You need to be a verified user to edit your profile details.
                    </p>

                    <p className="text-gray-500 text-sm text-center mb-8">
                        This helps us prevent impersonation and keeps the community safe.
                    </p>

                    <button 
                        onClick={() => navigate('/verification')}
                        className="w-full relative group overflow-hidden rounded-2xl mb-4"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] to-[#764ba2] transition-transform duration-300 group-hover:scale-[1.02]"></div>
                        <div className="relative flex items-center justify-center px-6 py-4 shadow-xl">
                            <span className="text-white text-lg font-bold mr-2">Verify Identity</span>
                            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate(-1)}
                        className="py-3 text-[#a0aec0] font-semibold text-base hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileVerificationRequired;
