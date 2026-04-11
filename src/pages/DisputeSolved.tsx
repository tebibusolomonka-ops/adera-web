import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Home, AlertTriangle } from 'lucide-react';

const DisputeSolved = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { transaction, role } = location.state || {};
    const isSeller = role === 'seller';

    const config = isSeller ? {
        title: 'Dispute Closed',
        message: 'The dispute was resolved in favor of the buyer.',
        bgColor: 'bg-[#FED7D7]',
        iconColor: 'text-[#C53030]',
        Icon: AlertCircle,
        subMessage: 'The transaction has been cancelled and refunded. Please ensure you deliver items as described to avoid future disputes.',
        btnColor: 'bg-[#C53030] hover:bg-[#9B2C2C]',
        isWarning: true,
    } : {
        title: 'Dispute Solved',
        message: 'The dispute has been resolved in your favor.',
        bgColor: 'bg-[#C6F6D5]',
        iconColor: 'text-[#38A169]',
        Icon: ShieldCheck,
        subMessage: 'Thank you for using this platform. We are sorry for the inconvenience regarding this transaction. A refund has been processed.',
        btnColor: 'bg-[#38A169] hover:bg-[#2F855A]',
        isWarning: false,
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
                
                {/* Icon Circle */}
                <div className={`w-[140px] h-[140px] rounded-full ${config.bgColor} flex items-center justify-center mb-8 shadow-lg`}>
                    <config.Icon className={`w-[80px] h-[80px] ${config.iconColor}`} />
                </div>

                <h1 className="text-[28px] font-extrabold text-white mb-3">{config.title}</h1>
                
                <p className="text-[18px] text-gray-400 mb-10 max-w-sm leading-relaxed">
                    {config.message}
                </p>

                {/* Details Card */}
                <div className="w-full max-w-md bg-surface rounded-[16px] p-6 shadow-md border border-white/5 mb-10">
                    <p className="text-[16px] text-gray-300 leading-relaxed mb-5 font-medium text-center">
                        {config.subMessage}
                    </p>

                    {config.isWarning && (
                        <div className="bg-[#FFF5F5]/10 p-3 rounded-lg border border-[#FEB2B2]/30 mb-5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#C53030]" />
                                <span className="text-[#FEB2B2] text-[13px] font-bold uppercase">Caution</span>
                            </div>
                            <p className="text-[#FEB2B2]/80 text-[13px] leading-[18px]">
                                Repeated disputes against your account may result in suspension or a permanent ban.
                            </p>
                        </div>
                    )}

                    {transaction && (
                        <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10">
                            <span className="text-[14px] text-gray-400">Transaction ID:</span>
                            <span className="text-[14px] font-semibold text-white">#{transaction.id}</span>
                        </div>
                    )}
                </div>

                {/* Back to Home */}
                <button 
                    onClick={() => navigate('/', { replace: true })}
                    className={`w-full max-w-md py-4.5 rounded-xl ${config.btnColor} text-white font-extrabold text-[16px] flex items-center justify-center transition shadow-lg`}
                >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Home
                </button>

            </div>
        </div>
    );
};

export default DisputeSolved;
