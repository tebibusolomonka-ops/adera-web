import { useState, useCallback, useEffect } from 'react';
import { RefreshCcw, Receipt, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface TransactionItem {
  id: string;
  title: string;
  price: string;
  status: string;
  displayStatus: string;
  image: string;
  type: 'purchase' | 'sale';
  created_at: string;
  raw: any; // Keep raw data for navigation logic
}

const getDisplayStatus = (status: string) => {
  if (!status) return "Unknown";
  const statusMap: Record<string, string> = {
    'completed': 'Completed',
    'dispute_completed': 'Dispute Completed',
    'dispute_rejected': 'Dispute Rejected',
    'pending_approval': 'Pending Approval',
    'approved': 'Action Required',
    'seller_released': 'Action Required',
    'released': 'Action Required',
    'disputed': 'Disputed',
    'pending_sale': 'Pending Sale',
    'rejected': 'Rejected',
    'failed': 'Failed',
    'cancelled': 'Cancelled',
    'payment_processing': 'Processing Payment',
    'paid': 'Payment Approved'
  };
  return statusMap[status] || status.replace(/_/g, " ");
};

const getBadgeColor = (status: string) => {
    if (status === 'completed') return 'bg-[#48BB78]'; // Green
    if (status === 'rejected' || status === 'failed') return 'bg-[#E53E3E]'; // Red
    if (status === 'disputed') return 'bg-[#ECC94B]'; // Yellow
    if (status === 'approved' || status === 'seller_released' || status === 'released') return 'bg-[#3182CE]'; // Blue
    return 'bg-[#ED8936]'; // Default Orange
};

const Transaction = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
    const [transactions, setTransactions] = useState<TransactionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
  
    const [purchases, setPurchases] = useState<TransactionItem[]>([]);
    const [sales, setSales] = useState<TransactionItem[]>([]);
    const [loadingPurchases, setLoadingPurchases] = useState(true);
    const [loadingSales, setLoadingSales] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        // Listen for Purchases
        const qPurchases = query(collection(db, 'transactions'), where('buyerId', '==', user.uid));
        const unsubPurchases = onSnapshot(qPurchases, snapshot => {
            const items = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.listingDetails?.title || 'Unknown Item',
                    price: data.amount?.toString() || '0',
                    status: data.status,
                    displayStatus: getDisplayStatus(data.status),
                    image: data.listingDetails?.imageUrl || '',
                    type: 'purchase' as const,
                    created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                    raw: { id: doc.id, ...data },
                };
            });
            setPurchases(items);
            setLoadingPurchases(false);
        }, err => {
            console.error(err);
            setLoadingPurchases(false);
        });
    
        // Listen for Sales
        const qSales = query(collection(db, 'transactions'), where('sellerId', '==', user.uid));
        const unsubSales = onSnapshot(qSales, snapshot => {
            const items = snapshot.docs.map(doc => {
                 const data = doc.data();
                return {
                    id: doc.id,
                    title: data.listingDetails?.title || 'Unknown Item',
                    price: data.amount?.toString() || '0',
                    status: data.status,
                    displayStatus: getDisplayStatus(data.status),
                    image: data.listingDetails?.imageUrl || '',
                    type: 'sale' as const,
                    created_at: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                    raw: { id: doc.id, ...data },
                };
            });
            setSales(items);
            setLoadingSales(false);
        }, err => {
             console.error(err);
             setLoadingSales(false);
        });
    
        return () => {
            unsubPurchases();
            unsubSales();
        };
      }, [user]);

      // Combine and Sort
      useEffect(() => {
         const all = [...purchases, ...sales].sort((a, b) => {
            // Check if toMillis exists (for Firebase Timestamp) otherwise standard JS timestamp logic
            const dateA = a.raw?.updatedAt?.toMillis ? a.raw.updatedAt.toMillis() : (new Date(a.created_at).getTime());
            const dateB = b.raw?.updatedAt?.toMillis ? b.raw.updatedAt.toMillis() : (new Date(b.created_at).getTime());
            return dateB - dateA;
         });
         setTransactions(all);
         
         if (!loadingPurchases && !loadingSales) {
             setLoading(false);
             setRefreshing(false);
         }
      }, [purchases, sales, loadingPurchases, loadingSales]);

      const onRefresh = useCallback(() => {
          setRefreshing(true);
          setTimeout(() => setRefreshing(false), 1000);
      }, []);

      const ongoingStatuses = [
          "pending_approval",
          "pending", // also include standard pending just in case
          "approved",
          "paid",
          "seller_released",
          "released",
          "disputed",
          "pending_sale",
          "rejected",
          "failed",
          "cancelled",
          "payment_processing",
      ];
    
      const filteredData = transactions.filter(t => {
           if (activeTab === 'ongoing') {
               return ongoingStatuses.includes(t.status);
           } else {
               return t.status === 'completed' || t.status === 'dispute_completed' || t.status === 'dispute_rejected';
           }
      });

      const handlePress = (item: TransactionItem) => {
          // Check status for completed screen
          if (item.status === 'completed') {
               navigate('/transaction-completed', { state: { transaction: item.raw } });
               return;
          }
    
          // Start Release Credentials Flow (Seller) or View Credentials (Buyer)
          if (item.status === 'approved' || item.status === 'seller_released' || item.status === 'released') {
              if (item.type === 'sale') {
                 if (item.status === 'released') {
                      navigate('/waiting-for-confirmation', { state: { transactionId: item.id } });
                 } else {
                      navigate('/release-credentials', { state: { item: item.raw } });
                 }
              } else {
                 navigate('/view-credentials', { state: { item: item.raw } });
              }
              return;
          }
    
          // Check for pending approval
          if (item.status === 'pending_approval' || item.status === 'pending') {
               // The PaymentVerification expects the 'item' to be the transaction or listing, 
               // so we pass item.raw directly
               navigate('/payment-verification', { state: { item: item.raw } });
               return;
          }
    
          // Check for paid (Approved by Admin)
          if (item.status === 'paid') {
                if (item.type === 'sale') {
                     // Seller needs to release
                     navigate('/release-credentials', { state: { item: item.raw } });
                } else {
                     // Buyer waits for seller - Use ViewCredentials (Wait State)
                     navigate('/view-credentials', { state: { item: item.raw } });
                }
                return;
           }
    
          // Check for disputed
          if (item.status === 'disputed') {
               if (item.type === 'sale') {
                    navigate('/seller-dispute', { state: { transaction: item.raw } });
               } else {
                    navigate('/dispute-details', { state: { transaction: item.raw, role: 'buyer' } });
               }
               return;
          }
    
          // Check for dispute outcome (Resolved or Rejected)
          if (item.status === 'dispute_rejected') {
               navigate('/dispute-outcome', { state: {
                   outcome: 'rejected', 
                   transaction: item.raw,
                   role: item.type === 'sale' ? 'seller' : 'buyer' 
               }});
               return;
          }
    
          if (item.status === 'dispute_completed') {
               navigate('/dispute-solved', { state: { 
                   transaction: item.raw,
                   role: item.type === 'sale' ? 'seller' : 'buyer'
               }});
               return;
          }
    
          // Basic Navigation Logic mapped from Web
          if (item.type === 'purchase') {
               navigate('/my-purchases'); 
          } else {
               navigate('/my-sales');
          }
      };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-8">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/5 bg-surface">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1 mr-2 hover:bg-white/10 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-[20px] font-bold text-white">My Transactions</h1>
                </div>
                <button onClick={onRefresh} className={`p-2 bg-surfaceLight rounded-full hover:bg-white/10 transition ${refreshing ? 'opacity-50' : ''}`}>
                    <RefreshCcw className={`w-5 h-5 text-primary-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-surface m-5 p-1.5 rounded-2xl shadow-sm border border-white/5 relative z-10">
                <button 
                    onClick={() => setActiveTab('ongoing')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'ongoing' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Ongoing
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'completed' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                    Completed
                </button>
            </div>

            {/* List */}
            <div className="px-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center mt-20">
                         <Loader2 className="w-10 h-10 text-[#667eea] animate-spin mb-4" />
                         <span className="text-gray-400 text-sm font-medium">Loading transactions...</span>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 opacity-50">
                        <Receipt className="w-14 h-14 text-gray-500 mb-4" />
                        <p className="text-[14px] text-gray-400 font-medium">No {activeTab} transactions found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredData.map(item => {
                            let imageUrl = item.image;
                            if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:image')) {
                                imageUrl = 'https://via.placeholder.com/150';
                            }
                            if (!imageUrl) imageUrl = 'https://via.placeholder.com/150';

                            return (
                                <button 
                                    key={`${item.id}-${item.type}`} 
                                    onClick={() => handlePress(item)}
                                    className="w-full bg-surface rounded-2xl p-3 flex flex-row items-center border border-white/5 hover:bg-surfaceLight transition-colors text-left"
                                >
                                    <div className="w-[60px] h-[60px] rounded-xl bg-surfaceLight mr-3 overflow-hidden flex items-center justify-center shrink-0">
                                        <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-center mr-2 overflow-hidden">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-[15px] font-bold text-white truncate mr-2 flex-1">{item.title}</h3>
                                            <div className={`px-2 py-[2px] rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${item.type === 'purchase' ? 'bg-[#EBF8FF] text-[#4299E1]' : 'bg-[#F0FFF4] text-[#48BB78]'}`}>
                                                {item.type === 'purchase' ? 'Buy' : 'Sell'}
                                            </div>
                                        </div>
                                        
                                        <div className={`px-2 py-[3px] rounded-[6px] text-[10px] font-bold w-fit mb-1.5 shadow-sm text-white ${getBadgeColor(item.status)}`}>
                                            {item.displayStatus}
                                        </div>
                                        
                                        <div className="flex flex-row justify-between items-center pr-2">
                                            <p className="text-[14px] font-bold text-gray-300">{parseFloat(item.price).toFixed(2)} ETB</p>
                                            <p className="text-[10px] text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-gray-600 shrink-0" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Transaction;
