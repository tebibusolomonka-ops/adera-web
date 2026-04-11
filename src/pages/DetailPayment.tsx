import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const getValidImageUrl = (url?: string) => {
  if (!url || url.startsWith('file://')) {
    return 'https://via.placeholder.com/150';
  }
  return url;
};

const DetailPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { item } = location.state || {};

  // Default/Fallback data
  const data = item || {
    id: 'default',
    title: 'Item Request',
    price: 0,
    image_url: 'https://via.placeholder.com/150',
    seller: { name: 'this_is_me', handle: '@this_is_me' },
    status: 'active'
  };

  const price = Number(data.price) || 0;
  const serviceFee = price * 0.05;
  const totalPrice = price + serviceFee;

  const steps = [
    { number: 1, title: 'Buyer Initiates Transaction.', desc: 'You started the process and the seller was notified.', active: true },
    { number: 2, title: 'Buyer pays the amount.', desc: 'Pay the amount to the escrow account to secure the item.', active: false },
    { number: 3, title: 'Money secured.', desc: 'The seller will transfer ownership of the digital asset.', active: false },
    { number: 4, title: 'Buyer confirms delivery.', desc: 'You confirm that you have received the item successfully.', active: false },
  ];

  const handleNext = () => {
     if (data.status === 'payment_pending') {
         alert("Item Unavailable: This item is currently being processed by another buyer.");
         return;
     }
     if (data.status === 'sold') {
         alert("Item Unavailable: This item has already been sold.");
         return;
     }
     navigate('/payment-methods', { state: { item: data } }); 
  };

  const isUnavailable = data.status === 'payment_pending' || data.status === 'sold';

  return (
    <div className="flex flex-col min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="bg-[#667eea] rounded-b-[24px] mb-6 shadow-sm relative pt-4 md:pt-6">
        <div className="flex items-center justify-between px-5 h-[60px]">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition relative z-10">
             <ChevronLeft className="w-7 h-7 text-white" />
          </button>
          <span className="text-white text-[18px] font-semibold flex-1 text-center pr-8">Detail Payment</span>
        </div>
      </div>

      <div className="px-5 w-full flex-1">
        
        {/* Item Information Card */}
        <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5">
           <h3 className="text-[#667eea] text-[16px] font-bold mb-4">Item Information</h3>
           <div className="flex flex-row items-center">
              <img 
                src={getValidImageUrl(data.image_url)} 
                alt={data.title} 
                className="w-16 h-16 rounded-xl object-cover bg-gray-600" 
              />
              <div className="flex-1 ml-4 flex flex-col justify-center">
                 <h4 className="text-[16px] font-semibold text-white mb-1.5 leading-tight">{data.title}</h4>
                 <span className="text-[12px] text-gray-400 mb-1.5">
                    From <span className="text-[#2ecc71] font-medium">{data.seller?.handle || '@seller'}</span>
                 </span>
                 <span className="text-[16px] font-bold text-white leading-none">{price.toFixed(2)} birr</span>
              </div>
           </div>
        </div>

        {/* How it Works Card */}
        <div className="bg-surface rounded-2xl p-4 mb-6 shadow-sm border border-white/5">
           <h3 className="text-[#667eea] text-[16px] font-bold mb-5">How it Works:</h3>
           <div className="flex flex-col gap-5">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-row items-start">
                   <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 ${step.active ? 'bg-[#2ecc71]' : 'bg-[#e6fffa]'}`}>
                      <span className={`text-[12px] font-bold ${step.active ? 'text-white' : 'text-[#2ecc71]'}`}>{step.number}</span>
                   </div>
                   <div className="flex-1 flex flex-col pt-0.5">
                      <h4 className="text-[14px] font-semibold text-white mb-1 leading-none">{step.title}</h4>
                      <p className="text-[13px] text-gray-400 leading-[18px]">{step.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Price Summary */}
        <div className="px-2 mb-8">
           <div className="flex flex-row justify-between items-center mb-3">
              <span className="text-[14px] text-gray-400">Service fee (5%)</span>
              <span className="text-[14px] font-medium text-white">{serviceFee.toFixed(2)} birr</span>
           </div>
           <div className="flex flex-row justify-between items-center mt-4">
              <span className="text-[16px] font-bold text-white">Total price</span>
              <span className="text-[18px] font-bold text-[#667eea]">{totalPrice.toFixed(2)} birr</span>
           </div>
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          disabled={isUnavailable}
          className={`w-full h-[56px] rounded-full flex items-center justify-center transition shadow-[0_8px_16px_rgba(255,107,107,0.3)]
             ${isUnavailable ? 'bg-[#bdc3c7] cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] hover:opacity-90'}
          `}
        >
          <span className="text-white text-[18px] font-bold">Next</span>
        </button>

      </div>
    </div>
  );
};

export default DetailPayment;
