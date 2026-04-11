import { ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerificationRequired = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
             {/* Decorative Gradient Header */}
             <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-[40px] shadow-lg z-0">
                <div className="absolute -top-[50px] -left-[50px] w-[200px] h-[200px] rounded-full bg-white/10 blur-md"></div>
                <div className="absolute bottom-[50px] -right-[20px] w-[150px] h-[150px] rounded-full bg-white/10 blur-md"></div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center px-5 mt-[60px] z-10 w-full max-w-md mx-auto">
                <div className="bg-surface rounded-3xl p-8 flex flex-col items-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/5 w-full">
                    
                    <div className="w-[100px] h-[100px] rounded-full bg-[#2D3748] border-4 border-surface shadow-[0_4px_15px_rgba(118,75,162,0.3)] flex justify-center items-center mb-6">
                        <ShieldCheck className="w-[60px] h-[60px] text-[#764ba2]" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-[#2D3748] dark:text-white mb-3 text-center">
                        Verification Required
                    </h2>
                    
                    <p className="text-[16px] text-[#718096] dark:text-gray-400 text-center mb-2 leading-relaxed font-medium">
                        To ensure a safe community, only verified users can access this feature.
                    </p>

                    <p className="text-[14px] text-[#A0AEC0] dark:text-gray-500 text-center mb-8 font-medium">
                        It only takes a minute to verify your identity to start selling and chatting!
                    </p>

                    <button 
                        onClick={() => navigate('/verify')}
                        className="w-full rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(102,126,234,0.3)] mb-4 hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                        <div className="w-full h-14 bg-gradient-to-r from-[#667eea] to-[#764ba2] flex justify-center items-center">
                            <span className="text-white text-lg font-bold mr-2">Verify Now</span>
                            <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate(-1)}
                        className="py-3 hover:opacity-80 transition-opacity"
                    >
                        <span className="text-[#A0AEC0] dark:text-gray-500 text-[16px] font-semibold">Maybe Later</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationRequired;
