import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Copy, AlertTriangle, Send, Loader2, Info } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';

const getValidImageUrl = (url?: string) => {
    if (!url || url.startsWith('file://')) {
        return 'https://via.placeholder.com/150';
    }
    return url;
};

const ViewCredentials = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { item: initialItem } = location.state || {};
    const [item, setItem] = useState(initialItem || {});
    
    const [loading, setLoading] = useState(false);
    const [buyerUsername, setBuyerUsername] = useState('');
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [disputeModalVisible, setDisputeModalVisible] = useState(false);

    useEffect(() => {
        if (!initialItem?.id) return;

        const unsubscribe = onSnapshot(doc(db, 'transactions', initialItem.id), (documentSnapshot) => {
            if (documentSnapshot.exists()) {
                const data = documentSnapshot.data();
                setItem((prev: any) => ({ ...prev, ...data, id: documentSnapshot.id }));
            }
        }, error => {
            console.error("Error fetching transaction update:", error);
        });

        return () => unsubscribe();
    }, [initialItem?.id]);

    const isReleased = item?.status === 'released' || item?.status === 'seller_released';
    const isCompleted = item?.status === 'completed';
    const isTelegram = item?.listingDetails?.category === 'Telegram' || item?.category === 'Telegram';

    const handleConfirmPress = () => setConfirmModalVisible(true);

    const processCompletion = async () => {
        setConfirmModalVisible(false);
        if (!item?.id) {
            alert("Error: Transaction ID is missing.");
            return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, 'transactions', item.id), {
                status: 'completed',
                completedAt: serverTimestamp(),
            });
            setLoading(false);
            navigate('/transaction-completed', { replace: true, state: { transaction: { ...item, status: 'completed' } } });
        } catch (error) {
            console.error("Error completing transaction:", error);
            setLoading(false);
            alert('Error: Failed to update transaction status. Please try again.');
        }
    };

    const handleReportIssue = () => setDisputeModalVisible(true);

    const confirmDispute = async () => {
        setDisputeModalVisible(false);
        if (!item?.id) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, 'transactions', item.id), {
                status: 'disputed',
                disputedAt: serverTimestamp(),
            });
            setLoading(false);
            navigate('/dispute-details', { replace: true, state: { transaction: { ...item, status: 'disputed' }, role: 'buyer' } });
        } catch (error) {
            console.error("Error disputing transaction:", error);
            setLoading(false);
            alert('Error: Failed to open dispute. Please try again.');
        }
    };

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const listing = item?.listingDetails || item?.listing || item || {};
    const imageUrl = getValidImageUrl(listing.image_url || listing.imageUrl || listing.image);

    const steps = [
        { id: 1, title: 'Buyer Initiates Transaction', desc: 'You Started the process and the seller was notified.', active: true },
        { id: 2, title: 'Buyer pays the amount', desc: 'Pay the amount to the escrow account.', active: true },
        { id: 3, title: 'Money secured', desc: 'The seller will transfer ownership.', active: true }, 
        { id: 4, title: 'Buyer confirms delivery', desc: 'You confirm that you have received the item successfully.', active: isCompleted },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5 bg-surface">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition relative z-10 w-11 flex items-center justify-center">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <span className="text-white text-[18px] font-semibold flex-1 text-center pr-8">View Credentials</span>
            </div>

            <div className="px-5 w-full flex-1 pt-4">
                
                {/* Item Card */}
                <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5 flex flex-row items-center">
                    <img src={imageUrl} alt="Item" className="w-[60px] h-[60px] rounded-xl object-cover bg-surfaceLight mr-3" />
                    <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-[15px] font-bold text-white mb-1 leading-tight line-clamp-2">{listing.title || 'Unknown Item'}</h4>
                        <div className="flex items-center mb-1">
                            <span className="text-[12px] text-gray-400">From <span className="text-[#667eea] font-bold">@{listing.user?.name || item.seller_name || 'Seller'}</span></span>
                        </div>
                        <span className="text-[14px] font-bold text-white">{listing.price || item.price || item.amount} ETB</span>
                    </div>
                </div>

                {/* Steps Card */}
                <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5">
                    {steps.map((step) => (
                        <div key={step.id} className="flex mb-4 last:mb-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 ${step.active ? 'bg-[#667eea]' : 'bg-surfaceLight'}`}>
                                <span className="text-white text-[12px] font-bold">{step.id}</span>
                            </div>
                            <div>
                                <h4 className="text-[14px] font-bold text-white mb-0.5">{step.title}</h4>
                                <p className="text-[12px] text-gray-400 leading-snug">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Credentials / Status Section */}
                <div className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-white/5">
                    <h3 className="text-[16px] font-bold text-white mb-2">Note</h3>
                    <p className="text-[13px] text-gray-400 leading-relaxed mb-5">
                        The Seller Transfer the ownership successfully. You should change the Items username and password after you login using provided below. Then Change immediately as you want.
                    </p>

                    {isReleased ? (
                        <div className="mt-2">
                            <div className="mb-4">
                                <label className="block text-[13px] font-semibold text-white mb-1.5">Username</label>
                                <div className="flex items-center border border-white/10 rounded-lg h-12 px-3 bg-background">
                                    <span className="flex-1 text-[15px] text-white font-mono">{item.username || item.raw?.username || 'Fetching...'}</span>
                                    <button 
                                        disabled={!item.username && !item.raw?.username}
                                        onClick={() => copyToClipboard(item.username || item.raw?.username || '')} 
                                        className="p-2 hover:bg-white/5 rounded-md text-[#667eea] transition"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[13px] font-semibold text-white mb-1.5">Password</label>
                                <div className="flex items-center border border-white/10 rounded-lg h-12 px-3 bg-background">
                                    <span className="flex-1 text-[15px] text-white font-mono">{item.password || item.raw?.password || 'Fetching...'}</span>
                                    <button 
                                        disabled={!item.password && !item.raw?.password}
                                        onClick={() => copyToClipboard(item.password || item.raw?.password || '')} 
                                        className="p-2 hover:bg-white/5 rounded-md text-[#667eea] transition"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`p-5 rounded-lg flex flex-col items-center justify-center text-center ${isTelegram && !item.buyerTelegramUsername ? 'bg-transparent border border-white/10' : 'bg-[#3182CE]/20'}`}>
                            {isTelegram && !item.buyerTelegramUsername ? (
                                <div className="w-full relative">
                                    <p className="text-[13px] text-white font-semibold mb-3">
                                        To proceed, please provide your Telegram Username so the Seller can transfer ownership to you.
                                    </p>
                                    <div className="flex items-center border border-white/10 rounded-lg h-12 px-3 bg-background mb-3">
                                        <Send className="w-5 h-5 text-[#0088cc] mr-2" />
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent border-none outline-none text-white text-[15px]"
                                            placeholder="@username"
                                            value={buyerUsername}
                                            onChange={(e) => setBuyerUsername(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        disabled={loading}
                                        onClick={async () => {
                                            if (!buyerUsername) return alert("Please enter your username");
                                            setLoading(true);
                                            try {
                                                await updateDoc(doc(db, 'transactions', item.id), {
                                                    buyerTelegramUsername: buyerUsername
                                                });
                                                setLoading(false);
                                                alert("Username sent to Seller! Please wait for them to transfer ownership.");
                                            } catch (e) {
                                                console.error(e);
                                                setLoading(false);
                                                alert("Failed to send username.");
                                            }
                                        }}
                                        className="w-full h-12 rounded-lg bg-[#0088cc] text-white font-bold flex items-center justify-center hover:bg-[#0088cc]/90 transition"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send to Seller'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Loader2 className="animate-spin w-6 h-6 text-[#90CDF4] mb-3" />
                                    <p className="text-[#90CDF4] text-[13px] font-medium leading-relaxed">
                                        {isTelegram && item.buyerTelegramUsername 
                                            ? `Waiting for Seller to transfer ownership to ${item.buyerTelegramUsername}...`
                                            : "The seller has not yet released the credentials. This page will update automatically."}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                {isReleased && !isCompleted && (
                    <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5">
                        <button 
                            disabled={loading}
                            onClick={handleConfirmPress}
                            className="w-full h-[50px] rounded-xl bg-[#667eea] text-white font-bold flex items-center justify-center mb-3 hover:opacity-90 transition disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : 'I Have Completed'}
                        </button>

                        <button 
                            onClick={handleReportIssue}
                            className="w-full py-2 flex justify-center text-[#E53E3E] font-bold text-[14px] hover:text-[#C53030] transition"
                        >
                            Report an Issue
                        </button>
                    </div>
                )}

            </div>

            {/* Confirmation Modal */}
            {confirmModalVisible && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
                    <div className="bg-surface w-full max-w-sm rounded-[20px] p-6 flex flex-col items-center shadow-xl border border-white/10">
                        <div className="w-16 h-16 rounded-full bg-[#667eea]/20 flex items-center justify-center mb-4">
                            <Info className="w-8 h-8 text-[#667eea]" />
                        </div>
                        <h2 className="text-[20px] font-bold text-white mb-2">Action Required</h2>
                        <p className="text-center text-gray-400 text-[14px] mb-6 leading-relaxed">
                            Please ensure you have logged in to the account and changed the password and recovery details. Are you sure you want to complete this transaction?
                        </p>
                        <div className="flex w-full gap-3">
                            <button 
                                onClick={() => setConfirmModalVisible(false)}
                                className="flex-1 py-3.5 rounded-xl bg-surfaceLight text-white font-semibold hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={processCompletion}
                                className="flex-1 py-3.5 rounded-xl bg-[#667eea] text-white font-bold hover:bg-[#5a6ee0] transition"
                            >
                                Yes, I'm Sure
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dispute Modal */}
            {disputeModalVisible && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
                    <div className="bg-surface w-full max-w-sm rounded-[20px] p-6 flex flex-col items-center shadow-xl border border-white/10">
                        <div className="w-16 h-16 rounded-full bg-[#FED7D7] flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-[#E53E3E]" />
                        </div>
                        <h2 className="text-[20px] font-bold text-white mb-2">Open Dispute</h2>
                        <p className="text-center text-gray-300 text-[15px] mb-3 leading-relaxed">
                            Are you sure you want to report an issue?
                        </p>
                        <p className="text-center text-[#FEB2B2] text-[13px] mb-6 leading-relaxed px-2">
                            This will open a formal dispute and pause the transaction. Using this feature frivolously may affect your account standing.
                        </p>
                        <div className="flex w-full gap-3">
                            <button 
                                onClick={() => setDisputeModalVisible(false)}
                                className="flex-1 py-3.5 rounded-xl bg-surfaceLight text-white font-semibold hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDispute}
                                className="flex-1 py-3.5 rounded-xl bg-[#E53E3E] text-white font-bold hover:bg-[#C53030] transition"
                            >
                                Open Dispute
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ViewCredentials;
