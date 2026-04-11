import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, AlertCircle, Home, AlertTriangle } from 'lucide-react';

const DisputeOutcome = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { outcome, transaction, role } = location.state || {};
    const isRejected = outcome === 'rejected';

    let config;

    if (isRejected) {
        if (role === 'seller') {
            // Seller Won (Dispute against them was rejected)
            config = {
                title: 'Dispute Resolved',
                message: 'The dispute filed against you has been rejected.',
                bgColor: 'bg-[#C6F6D5]',
                iconColor: 'text-[#38A169]',
                Icon: ShieldCheck,
                subMessage: 'We verified the transaction and found you were not at fault. Sorry for the inconvenience caused by this dispute.',
                btnColor: 'bg-[#38A169] hover:bg-[#2F855A]',
                cardBorderColor: 'border-t-[#38A169]',
                sectionTitle: 'Outcome Details',
                isWarning: false,
            };
        } else {
            // Buyer Lost (Their dispute was rejected)
            config = {
                title: 'Dispute Rejected',
                message: 'Your dispute claim was found invalid by our admin team.',
                bgColor: 'bg-[#FED7D7]',
                iconColor: 'text-[#C53030]',
                Icon: AlertCircle,
                subMessage: 'After thorough review, we decided to uphold the transaction.',
                btnColor: 'bg-[#C53030] hover:bg-[#9B2C2C]',
                cardBorderColor: 'border-t-[#C53030]',
                sectionTitle: 'Important Warning',
                isWarning: true,
            };
        }
    } else {
        // Fallback
        config = {
            title: 'Dispute Solved',
            message: 'The dispute has been processed.',
            bgColor: 'bg-[#C6F6D5]',
            iconColor: 'text-[#38A169]',
            Icon: ShieldCheck,
            subMessage: 'Thank you for your patience.',
            btnColor: 'bg-[#38A169] hover:bg-[#2F855A]',
            cardBorderColor: 'border-t-[#38A169]',
            sectionTitle: 'Outcome Details',
            isWarning: false,
        };
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
                
                {/* Icon Circle */}
                <div className={`w-[140px] h-[140px] rounded-full ${config.bgColor} flex items-center justify-center mb-8 shadow-lg`}>
                    <config.Icon className={`w-[80px] h-[80px] ${config.iconColor}`} />
                </div>

                <h1 className="text-[26px] font-extrabold text-white mb-4">{config.title}</h1>
                
                <p className="text-[16px] text-gray-400 leading-relaxed mb-10 max-w-sm">
                    {config.message}
                </p>

                {/* Details Card */}
                <div className={`w-full max-w-md bg-surface rounded-[16px] p-5 shadow-md border border-white/5 border-t-4 ${config.cardBorderColor} mb-10`}>
                    <h3 className="text-[18px] font-bold text-white mb-2.5">{config.sectionTitle}</h3>
                    
                    <p className={`text-[15px] leading-[22px] mb-5 ${config.isWarning ? 'text-[#E53E3E] font-bold' : 'text-gray-400'}`}>
                        {config.subMessage}
                    </p>

                    {config.isWarning && (
                        <div className="bg-[#FFF5F5]/10 p-3 rounded-lg border border-[#FEB2B2]/30 mb-5">
                            <div className="flex items-center gap-1.5 mb-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-[#C53030]" />
                                <span className="text-[#FEB2B2] text-[13px] font-bold uppercase">Caution</span>
                            </div>
                            <p className="text-[#FEB2B2]/80 text-[13px]">
                                Repeated violations or abuse of the dispute system may lead to account suspension.
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
                    Return to Home
                </button>

            </div>
        </div>
    );
};

export default DisputeOutcome;
