import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, RefreshCw } from 'lucide-react';
import { subscribeToTransaction, type Transaction } from '../services/transaction_service';

const getValidImageUrl = (url?: string) => {
    if (!url || url.startsWith('file://')) {
        return 'https://via.placeholder.com/150';
    }
    return url;
};

const PaymentVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { item } = location.state || {};

    const data = item || {};
    
    // Support both raw frontend objects and Firestore Transaction structures
    const title = data.listingDetails?.title || data.title || 'Unknown Item';
    const price = data.amount || data.price || 0;
    const imageUrl = data.listingDetails?.imageUrl || data.image_url || data.image || 'https://via.placeholder.com/150';
    const sellerHandle = data.seller?.handle || data.sellerName || data.sellerId || '@seller';

    const [lastChecked, setLastChecked] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [transaction, setTransaction] = useState<Transaction | any>(item);

    // Steps data - Steps 1, 2, 3 are active now
    const baseSteps = [
        { number: 1, title: 'Buyer Initiates Transaction.', desc: 'You Started the process and the seller was notified.', active: true },
        { number: 2, title: 'Buyer plays the amount.', desc: 'Pay the amount to the escrow account to the item.', active: true },
        { number: 3, title: 'Money secured.', desc: 'The seller will transfer ownership of the digital asset.', active: true },
        { number: 4, title: 'Buyer confirms delivery.', desc: 'You confirm that you have received the item successfully.', active: false },
    ];

    useEffect(() => {
        if (item?.id) {
            const unsubscribe = subscribeToTransaction(
                item.id,
                (updatedTx) => {
                    setTransaction(updatedTx);
                    setLastChecked(new Date());
                    setIsRefreshing(false);
                },
                (error) => {
                    console.error("Error watching transaction:", error);
                    setIsRefreshing(false);
                }
            );
            return () => unsubscribe();
        }
    }, [item?.id]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Subscription handles update automatically, but provide UI feedback
        setTimeout(() => setIsRefreshing(false), 2000);
    };

    // Prevent back button from taking user to the payment form
    useEffect(() => {
        window.history.pushState(null, '', window.location.href);
        const handlePopState = () => {
            navigate('/', { replace: true });
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [navigate]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="bg-[#667eea] rounded-b-[24px] mb-6 shadow-sm relative pt-4 md:pt-6">
                <div className="flex items-center justify-between px-5 h-[60px]">
                    <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition relative z-10 w-11 flex items-center justify-center">
                        <Home className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-white text-[18px] font-semibold flex-1 text-center pr-8">Detail Payment</span>
                </div>
            </div>

            <div className="px-5 w-full flex-1">
                
                {/* Item Information Card (Compact) */}
                <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5 flex flex-row items-center">
                    <img 
                        src={getValidImageUrl(imageUrl)} 
                        alt={title} 
                        className="w-[60px] h-[60px] rounded-xl object-cover bg-surfaceLight" 
                    />
                    <div className="flex-1 ml-3 flex flex-col justify-center">
                        <h4 className="text-[14px] font-semibold text-white mb-1 leading-tight">{title}</h4>
                        <div className="flex items-center mb-1">
                            <span className="text-[12px] text-gray-400">From</span>
                            <div className="flex items-center bg-[#f0fdf4]/10 px-2 py-0.5 rounded-full ml-1.5 border border-[#2ecc71]/20">
                                <div className="w-3.5 h-3.5 rounded-full bg-gray-600 mr-1.5" />
                                <span className="text-[#2ecc71] font-medium text-[12px]">{sellerHandle}</span>
                            </div>
                        </div>
                        <span className="text-[15px] font-bold text-white leading-none">{Number(price).toFixed(2)} ETB</span>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-surface rounded-2xl p-8 mb-5 shadow-sm border border-white/5 flex flex-col items-center justify-center">
                    <div className="mb-4">
                        <Clock className="w-12 h-12 text-[#667eea]" />
                    </div>
                    <h3 className="text-[18px] font-bold text-[#667eea] mb-2 text-center">Payment Verification</h3>
                    <p className="text-[14px] text-gray-400 text-center mb-6 leading-relaxed max-w-sm px-2">
                        Wait patiently, your payment is being verified. It won't take much time.
                    </p>

                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex flex-row items-center justify-center px-5 py-2.5 border border-[#667eea] rounded-[8px] mb-3 hover:bg-[#667eea]/10 transition group disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#667eea] mr-2 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                        <span className="text-[#667eea] font-semibold text-[14px]">Check Status Now</span>
                    </button>

                    <span className="text-[12px] text-gray-500">Last checked: {formatTime(lastChecked)}</span>
                </div>

                {/* Steps List */}
                <div className="bg-surface rounded-2xl p-4 mb-6 shadow-sm border border-white/5 pt-6">
                    <div className="relative">
                        {baseSteps.map((step, index) => {
                            let isActive = step.active;
                            
                            if (transaction?.status) {
                                if (step.number === 1) isActive = true;
                                if (step.number === 2) isActive = ['paid', 'approved', 'seller_released', 'released', 'completed'].includes(transaction.status); 
                                if (step.number === 3) isActive = ['approved', 'seller_released', 'released', 'completed'].includes(transaction.status);
                                if (step.number === 4) isActive = ['completed'].includes(transaction.status);
                            }

                            const isLast = index === baseSteps.length - 1;

                            return (
                                <div key={index} className="flex relative mb-6 last:mb-2">
                                    {/* Vertical Line Connector */}
                                    {!isLast && (
                                        <div className={`absolute left-[13px] top-[26px] bottom-[-24px] w-[2px] z-0
                                            ${isActive ? 'bg-[#2ecc71]' : 'bg-surfaceLight'}`} 
                                        />
                                    )}
                                    
                                    <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center mr-4 z-10 shrink-0
                                        ${isActive ? 'bg-[#2ecc71]' : 'bg-surfaceLight'}`}>
                                        <span className={`text-[12px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                            {step.number}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 pb-1">
                                        <h4 className="text-[14px] font-semibold text-white mb-1">{step.title}</h4>
                                        <p className="text-[13px] text-gray-400 leading-snug">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Home Button */}
                <button 
                    onClick={() => navigate('/')}
                    className="w-full h-[54px] rounded-[12px] flex items-center justify-center bg-transparent border-[1.5px] border-[#667eea] hover:bg-[#667eea]/10 transition"
                >
                    <span className="text-[#667eea] text-[16px] font-bold">Back to Home</span>
                </button>

            </div>
        </div>
    );
};

export default PaymentVerification;
