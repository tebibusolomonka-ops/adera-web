import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { createNotification } from '../services/notification_service';

const getValidImageUrl = (url?: string) => {
    if (!url || url.startsWith('file://')) {
        return 'https://via.placeholder.com/150';
    }
    return url;
};

const ReleaseCredentials = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    
    const { item: initialItem, transactionId } = location.state || {};
    const [item, setItem] = useState(initialItem || { id: transactionId });
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    const isTelegram = item?.listingDetails?.category === 'Telegram' || item?.category === 'Telegram';

    useEffect(() => {
        if (!item?.title && item?.id) {
            const fetchTransaction = async () => {
                try {
                    const docSnap = await getDoc(doc(db, 'transactions', item.id));
                    if (docSnap.exists()) {
                        setItem({ id: docSnap.id, ...docSnap.data() });
                    }
                } catch (e) {
                    console.error("Failed to fetch transaction", e);
                }
            };
            fetchTransaction();
        }
    }, [item?.id]);

    const attemptRelease = () => {
        if (!isTelegram && (!username || !password)) {
            alert('Error: Please fill in both username and password.');
            return;
        }
        setConfirmModalVisible(true);
    };

    const confirmRelease = async () => {
        setConfirmModalVisible(false);
        setLoading(true);

        try {
            await updateDoc(doc(db, 'transactions', item.id), {
                status: 'released',
                ...(isTelegram ? {} : { username: username, password: password }),
                releasedAt: serverTimestamp(),
            });

            if (item.buyerId) {
                await createNotification(
                    item.buyerId,
                    isTelegram ? 'Ownership Transferred' : 'Credentials Released',
                    isTelegram 
                        ? `Seller has confirmed the transfer of ${item.title || item.listingDetails?.title}. Please verify and confirm.`
                        : `Credentials for ${item.title || item.listingDetails?.title} have been released. Please verify them.`,
                    'success',
                    item.id
                );
            }


            setLoading(false);
            navigate('/waiting-for-confirmation', { state: { transactionId: item.id }, replace: true });
        } catch (error) {
            console.error("Error releasing credentials:", error);
            setLoading(false);
            alert('Error: Failed to release credentials. Please try again.');
        }
    };

    const listing = item?.listingDetails || item?.listing || item || {};
    const imageUrl = getValidImageUrl(listing.image_url || listing.imageUrl || listing.image);

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5 bg-surface">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition relative z-10 w-11 flex items-center justify-center">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <span className="text-white text-[18px] font-semibold flex-1 text-center pr-8">Release Credentials</span>
            </div>

            <div className="px-5 w-full flex-1 pt-4">
                
                {/* Item Card */}
                <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5 flex flex-row items-center">
                    <img src={imageUrl} alt="Item" className="w-[70px] h-[70px] rounded-xl object-cover bg-surfaceLight mr-3" />
                    <div className="flex-1 flex flex-col justify-center">
                        <h4 className="text-[16px] font-bold text-white mb-1 leading-tight line-clamp-2">{listing.title || 'Loading title...'}</h4>
                        <p className="text-[13px] text-gray-400 mb-1">
                            Sold to <span className="text-[#667eea] font-bold">@{item?.buyer || 'loading...'}</span>
                        </p>
                        <span className="text-[15px] font-bold text-white">{listing.price || item?.price || item?.amount || '...'} ETB</span>
                    </div>
                </div>

                {/* Reminders Card */}
                <div className="bg-surface rounded-2xl p-5 mb-5 shadow-sm border border-white/5">
                    <h3 className="text-[16px] font-bold text-white mb-3">Important Reminders</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start">
                            <span className="text-[#667eea] mr-2 text-[16px] leading-[22px]">•</span>
                            <span className="text-[14px] text-gray-400 leading-[20px]">Please disable any two-factor authentication (2FA).</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-[#667eea] mr-2 text-[16px] leading-[22px]">•</span>
                            <span className="text-[14px] text-gray-400 leading-[20px]">Remove any recovery phone numbers or emails from the account.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-[#667eea] mr-2 text-[16px] leading-[22px]">•</span>
                            <span className="text-[14px] text-gray-400 leading-[20px]">Double-check that the account username/email and password are correct.</span>
                        </li>
                    </ul>
                </div>

                {/* Credentials Form Card */}
                <div className="bg-surface rounded-2xl p-5 shadow-sm border border-white/5 mb-5">
                    <p className="text-[14px] text-gray-400 leading-[20px] mb-5">
                        Enter the account details below to transfer ownership to the buyer.
                    </p>

                    {isTelegram ? (
                        <div>
                            {item.buyerTelegramUsername ? (
                                <div className="mb-5">
                                    <label className="block text-[14px] font-semibold text-white mb-2">Transfer Ownership To:</label>
                                    <div className="bg-surface border border-[#667eea] rounded-[8px] p-4 flex justify-center items-center">
                                        <span className="text-[18px] font-bold text-[#667eea]">@{item.buyerTelegramUsername}</span>
                                    </div>
                                    <p className="mt-3 text-[13px] text-gray-400 text-center leading-relaxed">
                                        Go to Telegram app, open the channel/group settings, and transfer ownership to this username.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-5 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="animate-spin w-6 h-6 text-[#667eea] mb-3" />
                                    <p className="text-[14px] text-gray-400 mb-1">
                                        Waiting for Buyer to provide their Telegram Username...
                                    </p>
                                    <p className="text-[12px] text-gray-500">
                                        You cannot proceed until the buyer sends their details.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 mb-2">
                            <div>
                                <label className="block text-[14px] font-semibold text-white mb-2">Account Username or Email</label>
                                <input 
                                    type="text"
                                    className="w-full h-[50px] bg-background border border-white/10 rounded-[8px] px-4 text-[15px] text-white focus:border-[#667eea] outline-none transition"
                                    placeholder="Enter username/email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-semibold text-white mb-2">Account Password</label>
                                <div className="relative flex items-center w-full h-[50px] bg-background border border-white/10 rounded-[8px] focus-within:border-[#667eea] transition pr-2">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] text-white"
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-2 text-gray-400 hover:text-white transition"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={attemptRelease}
                        disabled={loading || (isTelegram && !item.buyerTelegramUsername)}
                        className={`w-full h-[50px] rounded-[8px] bg-[#667eea] text-white font-bold flex items-center justify-center mt-5 transition
                            ${loading || (isTelegram && !item.buyerTelegramUsername) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#5a6ee0]'}`}
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isTelegram ? "I have Transferred Ownership" : "Release Credentials")}
                    </button>
                </div>

            </div>
            
            {/* Professional Warning Modal */}
            {confirmModalVisible && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
                    <div className="bg-surface w-full max-w-sm rounded-[20px] p-6 flex flex-col items-center shadow-xl border border-white/10">
                        <div className="w-16 h-16 rounded-full bg-[#FED7D7] flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8 text-[#E53E3E]" />
                        </div>
                        <h2 className="text-[20px] font-bold text-white mb-2">Final Confirmation</h2>
                        <p className="text-center text-gray-300 text-[15px] mb-3 leading-relaxed">
                            Are you absolutely sure you want to release the credentials?
                        </p>
                        <p className="text-center text-[#FEB2B2] text-[13px] mb-6 leading-relaxed px-2 font-medium">
                            There is NO GOING BACK after this step. The buyer will receive immediate access, and ownership transfers formally. Let's make sure everything is 100% correct.
                        </p>
                        <div className="flex w-full gap-3">
                            <button 
                                onClick={() => setConfirmModalVisible(false)}
                                className="flex-1 py-3.5 rounded-xl bg-surfaceLight text-white font-semibold hover:bg-white/10 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmRelease}
                                className="flex-1 py-3.5 rounded-xl bg-[#E53E3E] text-white font-bold hover:bg-[#C53030] transition"
                            >
                                Yes, Complete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReleaseCredentials;
