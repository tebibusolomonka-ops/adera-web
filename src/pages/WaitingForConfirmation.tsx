import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const WaitingForConfirmation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { transactionId } = location.state || {};

    useEffect(() => {
        if (!transactionId) return;

        const unsubscribe = onSnapshot(doc(db, 'transactions', transactionId), (documentSnapshot) => {
            if (documentSnapshot.exists()) {
                const data = documentSnapshot.data();
                const status = data?.status;

                if (status === 'completed') {
                    navigate('/transaction-completed', { replace: true, state: { transaction: { id: transactionId, ...data } } });
                } else if (status === 'disputed') {
                    navigate('/seller-dispute', { replace: true, state: { transaction: { id: transactionId, ...data } } });
                }
            }
        }, error => {
            console.error("Error listening to transaction:", error);
        });

        return () => unsubscribe();
    }, [transactionId, navigate]);

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5 bg-surface">
                <div className="w-11" /> {/* Spacer */}
                <span className="text-white text-[18px] font-semibold flex-1 text-center">Awaiting Confirmation</span>
                <div className="w-11" /> {/* Spacer */}
            </div>

            <div className="px-5 w-full flex-1 pt-8 flex flex-col justify-center">
                
                {/* Central Card */}
                <div className="bg-surface rounded-[24px] p-8 flex flex-col items-center shadow-sm border border-white/5 text-center">
                    
                    <div className="w-16 h-16 rounded-full bg-[#667eea]/10 flex items-center justify-center mb-6">
                        <Loader2 className="animate-spin w-8 h-8 text-[#667eea]" />
                    </div>
                    
                    <h2 className="text-[22px] font-bold text-white mb-4">Credentials Sent</h2>
                    
                    <p className="text-[15px] text-gray-300 leading-relaxed mb-5">
                        The account details have been sent to the buyer. We are now waiting for them to confirm they have received and verified the credentials.
                    </p>
                    
                    <p className="text-[13px] text-gray-500 italic mb-2">
                        You will be redirected automatically once the buyer confirms.
                    </p>
                    
                </div>
            </div>

            {/* Bottom Navigation Element */}
            <div className="px-5 mt-auto pt-6">
                <button 
                    onClick={() => navigate('/transaction', { replace: true })}
                    className="w-full flex items-center justify-center py-4 bg-surface rounded-xl border border-white/10 text-[#667eea] font-semibold hover:bg-white/5 transition"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to My Transactions
                </button>
            </div>

        </div>
    );
};

export default WaitingForConfirmation;
