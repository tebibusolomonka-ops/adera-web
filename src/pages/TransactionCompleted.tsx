import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Star, Loader2, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../services/user_service';
import { addReview } from '../services/ReviewService';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const getValidImageUrl = (url?: string) => {
    if (!url || url.startsWith('file://')) {
        return 'https://via.placeholder.com/150';
    }
    return url;
};

const TransactionCompleted = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const { transaction } = location.state || {};
    
    const [sellerName, setSellerName] = useState('Seller');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    
    // Review State
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (transaction) {
            const fetchSeller = async () => {
                if (transaction.sellerId || transaction.seller_id) {
                    const profile = await getUserProfile(transaction.sellerId || transaction.seller_id);
                    if (profile) setSellerName(profile.displayName || 'Seller');
                }
            };
            fetchSeller();

            // Prevent self-reviews and multiple reviews
            const sellerId = transaction.sellerId || transaction.seller_id;
            if (transaction.hasReviewed || (user && user.uid === sellerId)) {
                return;
            }

            // Automatically open review modal after a short delay
            const timer = setTimeout(() => {
                setReviewModalVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [transaction, user]);

    if (!transaction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-5 text-center">
                <p className="text-white text-[16px] mb-5">Transaction details not found.</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="text-[#667eea] font-semibold hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const handleReviewSubmit = async () => {
        if (!transaction || !user) return;
        if (rating === 0) {
            alert("Please select a rating star first.");
            return;
        }

        setIsSubmitting(true);
        try {
            const buyerProfile = await getUserProfile(user.uid);
            
            const payload: any = {
                buyerId: user.uid,
                buyerName: buyerProfile?.displayName || user.displayName || 'Buyer',
                sellerId: transaction.sellerId || transaction.seller_id || '',
                listingId: transaction.listingId || transaction.listing_id || 'unknown',
                rating,
                comment,
            };
            
            if (buyerProfile?.photoURL || user.photoURL) {
                payload.buyerPhotoURL = buyerProfile?.photoURL || user.photoURL;
            }

            await addReview(payload);
            
            // Mark transaction as reviewed so it doesn't prompt again
            if (transaction.id) {
                await updateDoc(doc(db, 'transactions', transaction.id), { hasReviewed: true });
                // Also update local state
                transaction.hasReviewed = true; 
            }

            setIsSubmitting(false);
            setReviewModalVisible(false);
            
            // Show custom toast instead of alert
            setToastMessage("Review submitted successfully!");
            setTimeout(() => setToastMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
            alert("Failed to submit review. Please try again.");
        }
    };

    const listing = transaction.listingDetails || transaction.listing || transaction;
    const imageUrl = getValidImageUrl(listing.image_url || listing.imageUrl || listing.image);

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Scrollable Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
                
                {/* Success Icon */}
                <div className="w-[100px] h-[100px] rounded-full bg-[#C6F6D5] flex items-center justify-center mb-6 shadow-md">
                    <CheckCircle2 className="w-[60px] h-[60px] text-[#38A169]" />
                </div>

                <h2 className="text-[24px] font-bold text-white mb-3 text-center">Transaction Completed!</h2>
                
                <p className="text-[16px] text-gray-400 text-center leading-relaxed mb-8 max-w-sm">
                    Thank you for using our platform. This transaction was completed professionally and securely.
                </p>

                {/* Receipt Card */}
                <div className="w-full bg-surface rounded-[20px] p-6 shadow-lg border border-white/5 mb-8 text-left">
                    <div className="flex flex-row items-center mb-5">
                        <img src={imageUrl} alt="Item" className="w-[60px] h-[60px] rounded-[12px] mr-4 object-cover bg-surfaceLight" />
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-[18px] font-bold text-white mb-1 truncate">{listing.title || 'Unknown Item'}</h4>
                            <span className="text-[16px] font-semibold text-[#38A169]">
                                {parseFloat(transaction.amount || transaction.price || listing.price || 0).toFixed(2)} ETB
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-[1px] w-full bg-white/10 mb-5" />

                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[14px] text-gray-400">Transaction ID</span>
                        <span className="text-[14px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            #{transaction.id}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[14px] text-gray-400">Date</span>
                        <span className="text-[14px] font-semibold text-white">
                            {new Date(transaction.created_at || transaction.createdAt?.toMillis?.() || Date.now()).toLocaleDateString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[14px] text-gray-400">Status</span>
                        <div className="bg-[#C6F6D5] px-3 py-1.5 rounded-[12px]">
                            <span className="text-[#22543D] text-[12px] font-bold uppercase">Completed</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/')}
                    className="w-full max-w-[280px] bg-[#667eea] py-4 rounded-full flex flex-row items-center justify-center shadow-md hover:bg-[#5a6ee0] transition opacity-90 hover:opacity-100"
                >
                    <Home className="w-5 h-5 text-white mr-2" />
                    <span className="text-white text-[16px] font-bold">Back to Home</span>
                </button>

            </div>

            {/* Leave Review Feedback Modal */}
            {reviewModalVisible && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
                    <div className="bg-surface w-full max-w-sm rounded-[24px] p-6 flex flex-col items-center shadow-xl border border-white/10">
                        <h2 className="text-[20px] font-bold text-white mb-1">Rate the Seller</h2>
                        <p className="text-[14px] text-gray-400 mb-6 text-center">
                            How was your experience with <span className="font-bold text-[#667eea]">@{sellerName}</span>?
                        </p>

                        {/* Star Rating */}
                        <div className="flex flex-row justify-center mb-6 space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                >
                                    <Star 
                                        className={`w-10 h-10 ${rating >= star ? 'text-[#F6E05E] fill-[#F6E05E]' : 'text-gray-500'}`} 
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Feedback Textarea */}
                        <div className="w-full mb-6">
                            <textarea
                                className="w-full bg-background border border-white/10 rounded-[12px] p-4 text-[14px] text-white focus:border-[#667eea] outline-none transition resize-none h-[100px]"
                                placeholder="Write your feedback here (optional)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex w-full gap-3">
                            <button 
                                disabled={isSubmitting}
                                onClick={() => setReviewModalVisible(false)}
                                className="flex-1 py-3.5 rounded-[12px] bg-surfaceLight text-white font-semibold hover:bg-white/10 transition disabled:opacity-50"
                            >
                                Skip
                            </button>
                            <button 
                                disabled={isSubmitting || rating === 0}
                                onClick={handleReviewSubmit}
                                className="flex-[1.5] py-3.5 rounded-[12px] bg-[#667eea] text-white font-bold hover:bg-[#5a6ee0] transition disabled:opacity-50 flex items-center justify-center"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Toast */}
            {toastMessage && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] bg-[#38A169] text-white px-6 py-3 rounded-full shadow-xl flex items-center font-semibold animate-bounce">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default TransactionCompleted;
