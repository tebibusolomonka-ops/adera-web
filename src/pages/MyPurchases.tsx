import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Receipt } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscribeToTransactions } from '../services/transaction_service';
import type { Transaction } from '../services/transaction_service';
import { useAuth } from '../context/AuthContext';

const MyPurchases = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [purchases, setPurchases] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToTransactions(
        user.uid,
        'buyer',
        (items) => {
            setPurchases(items);
            setLoading(false);
        },
        (error) => {
            console.error("Error fetching purchases:", error);
            setLoading(false);
        }
    );

    return () => unsubscribe();
  }, [user]);

  const ongoingStatuses = [
    'pending_approval', 'approved', 'paid', 'seller_released', 
    'released', 'disputed', 'pending_sale', 
    'payment_processing', 'failed', 'cancelled'
  ];
  const completedStatuses = ['completed', 'rejected', 'dispute_completed', 'dispute_rejected'];

  const ongoingPurchases = purchases.filter(item => ongoingStatuses.includes(item.status));
  const completedPurchases = purchases.filter(item => completedStatuses.includes(item.status));

  const currentData = activeTab === 'ongoing' ? ongoingPurchases : completedPurchases;

  const getStatusDisplay = (status: string) => {
      const statusMap: Record<string, string> = {
          'completed': 'Completed',
          'dispute_completed': 'Dispute Solved',
          'dispute_rejected': 'Dispute Rejected',
          'pending_approval': 'Pending Approval',
          'approved': 'Action Required',
          'paid': 'Payment Approved', 
          'seller_released': 'Action Required',
          'released': 'Action Required',
          'disputed': 'Disputed',
          'rejected': 'Rejected',
      };
      return statusMap[status] || status;
  };

  const getBadgeColor = (status: string) => {
    if (status === 'completed' || status === 'dispute_completed') return '#48BB78'; // Green
    if (status === 'rejected' || status === 'dispute_rejected') return '#E53E3E'; // Red
    if (status === 'disputed') return '#ECC94B'; // Yellow
    if (status === 'approved' || status === 'seller_released' || status === 'released') return '#3182CE'; // Blue
    return '#ED8936'; // Orange default
  };

  const handlePress = (item: any) => {
    // Navigate based on status exactly like mobile app
    if (item.status === 'completed') {
        navigate('/transaction-completed', { state: { transaction: { ...item, type: 'purchase' } } });
        return;
    }
    // General detail navigation
    navigate(`/purchases/${item.id}`, { state: { item } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-surface sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition">
                 <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <span className="text-xl font-bold text-white">My Purchases</span>
          <div className="w-8" /> 
      </div>

      {/* Tabs */}
      <div className="flex bg-surface mx-5 mt-4 mb-4 rounded-[15px] p-1 shadow-md border border-white/5">
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`flex-1 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'ongoing' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold shadow-md' : 'text-gray-400 font-semibold hover:bg-white/5'}`}
        >
            Ongoing
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 h-10 rounded-xl flex items-center justify-center transition-all ${activeTab === 'completed' ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold shadow-md' : 'text-gray-400 font-semibold hover:bg-white/5'}`}
        >
            Completed
        </button>
      </div>

      {/* List */}
      <div className="px-5 pb-5">
        {!loading && currentData.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-12 opacity-70">
                <Receipt className="w-12 h-12 text-gray-500 mb-2" />
                <span className="text-sm text-gray-400 font-medium">
                    {activeTab === 'ongoing' ? 'You have no ongoing purchases.' : 'You have no completed purchases.'}
                </span>
            </div>
        ) : (
            currentData.map(item => {
                let imageUrl = item.listingDetails?.imageUrl;
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = 'https://placehold.co/70x70/1e1e1e/a9a9a9?text=Img'; 
                }

                return (
                    <div 
                        key={item.id} 
                        onClick={() => handlePress(item)}
                        className="bg-surface rounded-2xl p-3 mb-3 flex flex-row items-center border border-white/5 shadow-md hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <div className="w-[60px] h-[60px] rounded-xl bg-[#2D3748] mr-3 overflow-hidden flex items-center justify-center shrink-0">
                            <img 
                                src={imageUrl || 'https://placehold.co/100?text=Item'} 
                                className="w-full h-full object-cover" 
                                alt="Item" 
                            />
                        </div>
                
                        <div className="flex-1 justify-center mr-2">
                            <div className="flex flex-row items-center justify-between mb-1">
                                <span className="text-[15px] font-bold text-white line-clamp-1 mr-2 flex-1">
                                    {item.listingDetails?.title || 'Unknown Item'}
                                </span>
                                <div className="bg-[#EBF8FF] px-1.5 py-0.5 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-[#4299E1] tracking-wider uppercase">BUY</span>
                                </div>
                            </div>
                            
                            <div 
                                className="px-2 py-0.5 rounded-md self-start mb-1 table"
                                style={{ backgroundColor: getBadgeColor(item.status) }}
                            >
                                <span className="text-white text-[10px] font-bold leading-tight">{getStatusDisplay(item.status)}</span>
                            </div>
                            
                            <span className="text-[14px] font-bold text-white mb-0.5 block">
                                {item.amount ? item.amount.toFixed(2) : '0.00'} ETB
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium block">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                
                        <ChevronRight className="w-5 h-5 text-gray-500 shrinks-0" />
                    </div>
                )
            })
        )}
      </div>
    </div>
  );
};

export default MyPurchases;
