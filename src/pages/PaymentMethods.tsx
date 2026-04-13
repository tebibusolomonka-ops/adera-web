import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Smartphone, Building2, UploadCloud, Edit3, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { lockListingForPayment } from '../services/transaction_service';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const getValidImageUrl = (url?: string) => {
  if (!url || url.startsWith('file://')) {
    return 'https://via.placeholder.com/150';
  }
  return url;
};

const PaymentMethods = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { item } = location.state || {};
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Default/Fallback data
    const data = item || {
        id: 'default',
        title: 'Item Request',
        price: 0,
        image_url: 'https://via.placeholder.com/150',
        seller: { name: 'this_is_me', handle: '@this_is_me' },
    };

    const paymentMethods = [
        { label: 'CBE', account: '1000654958991', name: 'Tebibu Solomon' },
        { label: 'Awash', account: '01320814516500', name: 'Tebibu Solomon' },
        { label: 'Telebirr', account: '0902888810', name: 'Mintamir Tsegaye' },
        { label: 'Mpesa', account: '0704808810', name: 'Tebibu' },
    ];

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        alert(`${label} account number copied to clipboard.`);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large. Max size is 5MB.');
            return;
        }

        // Compress image using Canvas to mimic RN's quality: 0.4 and maxWidth: 600
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG with 0.4 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
                setScreenshotBase64(dataUrl);
            };
        };
    };

    const handleSubmit = async () => {
        if (!screenshotBase64) {
            alert('Please upload a payment screenshot first.');
            return;
        }
        if (!user) {
            alert('You must be logged in to make a purchase.');
            return;
        }

        try {
            setLoading(true);

            // Create Transaction in Firestore using atomic lock
            const transactionId = await lockListingForPayment(
                data.id,
                user.uid,
                data.sellerId || 'unknown_seller',
                Number(data.price),
                {
                    title: data.title,
                    imageUrl: data.image_url || data.imageUri || '',
                }
            );

            // Update the transaction with payment proof
            await updateDoc(doc(db, 'transactions', transactionId), {
                paymentProof: screenshotBase64
            });

            setLoading(false);
            // Proceed to next step without leaving payment submission in history
            navigate('/payment-verification', { state: { item: data }, replace: true }); 
            
        } catch (error) {
            console.error("Payment submission failed:", error);
            alert('Failed to submit payment. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background pb-10">
            {/* Header */}
            <div className="bg-[#667eea] rounded-b-[24px] mb-6 shadow-sm relative pt-4 md:pt-6">
                <div className="flex items-center justify-between px-5 h-[60px]">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition relative z-10 w-11">
                        <ChevronLeft className="w-7 h-7 text-white" />
                    </button>
                    <span className="text-white text-[18px] font-semibold flex-1 text-center pr-8">Detail Payment</span>
                </div>
            </div>

            <div className="px-5 w-full flex-1">
                
                {/* Item Information Card (Compact) */}
                <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5 flex flex-row items-center">
                    <img 
                        src={getValidImageUrl(data.image_url)} 
                        alt={data.title} 
                        className="w-[50px] h-[50px] rounded-[10px] object-cover bg-gray-600" 
                    />
                    <div className="flex-1 ml-3 flex flex-col justify-center">
                        <h4 className="text-[14px] font-semibold text-white mb-0.5 leading-tight">{data.title}</h4>
                        <span className="text-[12px] text-gray-400 mb-0.5">
                            From <span className="text-[#2ecc71] font-medium">{data.seller?.handle || '@seller'}</span>
                        </span>
                        <span className="text-[14px] font-bold text-white leading-none">{Number(data.price).toFixed(2)} ETB</span>
                    </div>
                </div>

                {/* Step 2: Make Payment Card */}
                <div className="bg-surface rounded-2xl p-4 mb-5 shadow-sm border border-white/5">
                    <h3 className="text-[#667eea] text-[16px] font-bold mb-3">Step 2: Make Payment</h3>
                    <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">
                        Transfer the <span className="font-bold text-white">exact amount</span> to one of the accounts below.
                    </p>
                    
                    {paymentMethods.map((method, index) => {
                        const isTelebirr = method.label === 'Telebirr';
                        const isMpesa = method.label === 'Mpesa';
                        const isCBE = method.label === 'CBE';
                        
                        return (
                            <div key={index} className="bg-background rounded-2xl border border-white/10 p-4 mb-4 shadow-sm">
                                <div className="flex flex-row items-center mb-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3
                                        ${isTelebirr ? 'bg-[#2C5282]' : isMpesa ? 'bg-[#4CAF50]' : isCBE ? 'bg-[#6B46C1]' : 'bg-[#276749]'}
                                    `}>
                                        {(isTelebirr || isMpesa) ? (
                                            <Smartphone className="w-5 h-5 text-white" />
                                        ) : (
                                            <Building2 className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                    <span className="text-[16px] font-bold text-white">{method.label}</span>
                                </div>
                                <div className="flex flex-row justify-between items-center bg-surface/50 rounded-xl p-3 border border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 mb-1 tracking-wider uppercase">Account Number</span>
                                        <span className="text-[15px] font-bold text-white mb-1 tracking-wider font-mono">{method.account}</span>
                                        <span className="text-[12px] text-gray-400">{method.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(method.account, method.label)}
                                        className="flex flex-row items-center bg-surface/80 px-3 py-2 rounded-full border border-white/10 hover:bg-white/10 transition"
                                    >
                                        <span className="text-[12px] font-semibold text-[#667eea] mr-1.5">Copy</span>
                                        <Copy className="w-4 h-4 text-[#667eea]" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Upload Payment Screenshot Card */}
                <div className="bg-surface rounded-2xl p-4 mb-6 shadow-sm border border-white/5">
                    <h3 className="text-[#667eea] text-[16px] font-bold mb-3">Step 3: Upload Proof</h3>
                    <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">
                        Please upload a clear screenshot of the successful transaction.
                    </p>
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                    />
                    
                    <button 
                        onClick={() => !screenshotBase64 && fileInputRef.current?.click()}
                        className={`w-full relative rounded-[20px] overflow-hidden bg-background mb-2 transition
                            ${screenshotBase64 ? 'h-[180px]' : 'h-[180px] border-2 border-dashed border-gray-600 hover:border-gray-500'}
                        `}
                    >
                        {screenshotBase64 ? (
                            <div className="w-full h-full relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <img src={screenshotBase64} alt="Payment Proof" className="w-full h-full object-cover" />
                                <div className="absolute top-0 left-0 w-full h-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Edit3 className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute bottom-2.5 right-2.5 flex flex-row items-center bg-black/60 px-3 py-1.5 rounded-full z-10">
                                    <Edit3 className="w-4 h-4 text-white mr-1.5" />
                                    <span className="text-[12px] font-semibold text-white">Change</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <div className="w-[60px] h-[60px] rounded-full bg-surfaceLight flex items-center justify-center mb-3">
                                    <UploadCloud className="w-8 h-8 text-[#667eea]" />
                                </div>
                                <span className="text-[15px] font-semibold text-white">Tap to upload screenshot</span>
                                <span className="text-[12px] text-gray-500 mt-1.5">Max file size: 5MB</span>
                            </div>
                        )}
                    </button>
                </div>

                {/* Submit Button */}
                <button 
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full h-[56px] rounded-full flex items-center justify-center bg-gradient-to-r from-[#ff6b6b] to-[#ff8787] hover:opacity-90 transition shadow-[0_8px_16px_rgba(255,107,107,0.3)] mt-2 disabled:opacity-75"
                >
                    {loading ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                        <span className="text-white text-[18px] font-bold">Submit for Approval</span>
                    )}
                </button>

            </div>
        </div>
    );
};

export default PaymentMethods;
