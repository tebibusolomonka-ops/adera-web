import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, AlertCircle, User, Info, MessageSquare } from 'lucide-react';

const getValidImageUrl = (url?: string) => {
    if (!url || url.startsWith('file://')) {
        return 'https://via.placeholder.com/150';
    }
    return url;
};

const SellerDispute = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Transaction Data
    const { transaction } = location.state || {};

    const itemTitle = transaction?.listingDetails?.title || transaction?.title || 'Item';
    const itemPrice = transaction?.amount || transaction?.price || '0.00';
    const buyerName = transaction?.buyerName || 'Buyer'; 
    
    const imageUrl = getValidImageUrl(transaction?.listingDetails?.imageUrl || transaction?.listingDetails?.image_url || transaction?.image_url || transaction?.image);
    const disputeReason = 'Buyer has reported an issue with the item.'; 

    if (!transaction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white p-5">
                <p>Transaction not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-[#667eea] font-semibold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5 bg-surface">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition relative z-10 w-11 flex items-center justify-center">
                   <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 text-center pr-8">
                    <h1 className="text-[18px] font-bold text-white">Dispute Center</h1>
                </div>
            </div>

            <div className="flex-1 px-5 pt-5 pb-8 overflow-y-auto">
                
                {/* Premium Alert Card */}
                <div className="bg-[#2D3748]/50 rounded-[16px] p-5 mb-6 shadow-sm border border-white/5">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#FED7D7] flex items-center justify-center mr-4 shrink-0">
                            <AlertCircle className="w-6 h-6 text-[#C53030]" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-[18px] font-bold text-white">Action Required</h2>
                            <p className="text-[13px] text-gray-400">Dispute raised by Buyer</p>
                        </div>
                    </div>
                    <div className="bg-[#1A202C]/60 p-3.5 rounded-xl border-l-[4px] border-[#FEEBC8]">
                        <p className="text-[#F6AD55] text-[14px] leading-[20px] font-medium">
                            The buyer has reported an issue. The transaction is on hold. Please review the claim and discuss with the admin to resolve this.
                        </p>
                    </div>
                </div>

                {/* Transaction Card */}
                <div className="bg-surface rounded-[16px] p-5 mb-8 shadow-sm border border-white/5">
                    <div className="flex flex-row items-center border-b border-white/10 pb-5 mb-5">
                         <img src={imageUrl} alt="Item" className="w-[70px] h-[70px] rounded-[14px] object-cover bg-surfaceLight shrink-0" />
                         <div className="flex-1 ml-4 overflow-hidden">
                             <h3 className="text-[18px] font-bold text-white mb-1 truncate">{itemTitle}</h3>
                             <p className="text-[16px] font-bold text-[#667eea]">{parseFloat(itemPrice).toFixed(2)} ETB</p>
                         </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-[#4A5568]/40 flex items-center justify-center mr-4 shrink-0">
                                <User className="w-[18px] h-[18px] text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[12px] text-gray-400 mb-0.5">Disputed by</p>
                                <p className="text-[15px] font-bold text-white">{buyerName}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-[#4A5568]/40 flex items-center justify-center mr-4 shrink-0">
                                <Info className="w-[18px] h-[18px] text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[12px] text-gray-400 mb-0.5">Reason</p>
                                <p className="text-[15px] font-bold text-white leading-tight">{disputeReason}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 mt-auto">
                    <button 
                        onClick={() => navigate('/dispute-details', { state: { transaction, role: 'seller' } })}
                        className="w-full py-4 rounded-[14px] bg-[#667eea] text-white font-bold text-[16px] flex flex-row items-center justify-center shadow-lg hover:bg-[#5a6ee0] transition"
                    >
                        <MessageSquare className="w-[20px] h-[20px] mr-2" />
                        Open Dispute Chat
                    </button>
                    
                    <button 
                        onClick={() => navigate('/transaction', { replace: true })}
                        className="w-full py-4 rounded-[14px] border border-white/10 text-gray-300 font-semibold text-[14px] flex items-center justify-center hover:bg-white/5 transition"
                    >
                        Return to Sales
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SellerDispute;
