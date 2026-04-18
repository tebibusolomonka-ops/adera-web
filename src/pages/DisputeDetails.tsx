import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Image as ImageIcon, Send, XCircle, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';

interface Message {
    id: string;
    body: string;
    image?: string;
    sender_type: 'user' | 'admin' | 'buyer' | 'seller';
    recipient_type?: 'buyer' | 'seller';
    created_at: any;
}

const DisputeDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { transaction, role } = location.state || {};
    const transactionId = transaction?.id;
    const userRole = role || 'buyer';
    
    const itemTitle = transaction?.title || transaction?.listing?.title || transaction?.listingDetails?.title || 'Unknown Item';
    const status = transaction?.status || 'disputed';

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [modalImageUri, setModalImageUri] = useState<string | null>(null);
    
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!transactionId) return;

        const q = query(
            collection(doc(db, 'transactions', transactionId), 'messages'),
            orderBy('created_at', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allMsgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Message[];
            // ... filtering and sorting logic remains the same
            const filteredMsgs = allMsgs.filter(msg => {
                const isFromAdmin = msg.sender_type === 'admin';
                if (userRole === 'buyer') {
                    if (msg.sender_type === 'seller') return false; 
                    if (isFromAdmin && msg.recipient_type === 'seller') return false; 
                    return true;
                } else {
                    if (msg.sender_type === 'buyer') return false;
                    if (isFromAdmin && msg.recipient_type === 'buyer') return false;
                    return true;
                }
            });

            filteredMsgs.sort((a, b) => {
                const getTime = (m: Message) => {
                    const t = m.created_at;
                    if (!t) return 0;
                    if (t.seconds) return t.seconds * 1000;
                    if (typeof t === 'string' || typeof t === 'number') return new Date(t).getTime();
                    return 0;
                };
                return getTime(a) - getTime(b);
            });

            setMessages(filteredMsgs);
            
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        });

        return () => unsubscribe();
    }, [transactionId, userRole]);

    const handleSend = async () => {
        if ((!inputText.trim() && !selectedImage) || !transactionId || isUploading) return;

        const textToSend = inputText.trim();
        const imageToUpload = selectedImage;
        
        setInputText('');
        setSelectedImage(null);
        setIsUploading(true);

        try {
            let imageUrl = null;
            if (imageToUpload) {
                // Upload to Cloudinary instead of storing Base64
                imageUrl = await uploadToCloudinary(imageToUpload, 'dispute_proofs');
            }

            await addDoc(collection(doc(db, 'transactions', transactionId), 'messages'), {
                body: textToSend,
                image: imageUrl,
                sender_type: userRole,
                created_at: serverTimestamp(),
            });
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("Image Too Large. Please pick a smaller one (Max 2MB).");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!transactionId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <p className="text-white">Transaction not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-[#667eea]">Go Back</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-surface z-10 shrink-0">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition relative">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex flex-col flex-1 items-center justify-center">
                    <h1 className="text-white text-[16px] font-bold">Support Ticket</h1>
                    <span className="text-gray-400 text-[12px]">Customer Support</span>
                </div>
                <div className="w-10"></div>
            </div>

            {/* Ticket Summary Card */}
            <div className="m-4 p-4 rounded-xl bg-surface border border-white/5 shadow-sm shrink-0">
                <p className="text-[14px] text-gray-300 mb-1">
                    Regarding: <span className="font-bold text-white">Dispute Request</span>
                </p>
                <p className="text-[14px] text-gray-300 mb-1">
                    For item: <span className="font-bold text-white">{itemTitle}</span>
                </p>
                <p className="text-[14px] text-gray-300">
                    Status: <span className="font-bold text-[#E53E3E] capitalize">{status.replace(/_/g, ' ')}</span>
                </p>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 font-sans">
                {messages.map((item) => {
                    let isMe = false;
                    if (userRole === 'buyer') {
                        isMe = item.sender_type === 'buyer' || item.sender_type === 'user';
                    } else {
                        isMe = item.sender_type === 'seller';
                    }

                    // Handle Timestamp
                    let timeString = '...';
                    if (item.created_at) {
                        if (item.created_at.seconds) {
                            timeString = new Date(item.created_at.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        } else if (typeof item.created_at === 'string' || typeof item.created_at === 'number') {
                            timeString = new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }

                    return (
                        <div key={item.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-[16px] ${isMe ? 'bg-[#667eea] rounded-tr-sm' : 'bg-surface border border-white/10 rounded-tl-sm'}`}>
                                {!isMe && (
                                    <p className="text-[11px] font-bold text-gray-400 mb-1">Admin</p>
                                )}
                                
                                {item.image && (
                                    <img 
                                        src={item.image} 
                                        alt="msg-img" 
                                        onClick={() => setModalImageUri(item.image as string)}
                                        className="w-full max-w-[200px] rounded-lg mb-2 object-cover cursor-pointer bg-surfaceLight" 
                                    />
                                )}

                                {item.body && (
                                    <p className={`text-[14px] leading-[20px] whitespace-pre-wrap ${isMe ? 'text-white' : 'text-gray-200'}`}>
                                        {item.body}
                                    </p>
                                )}
                                
                                <span className={`block text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                                    {timeString}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Image Preview */}
            {selectedImage && (
                <div className="flex items-center px-4 py-3 bg-surface border-t border-white/5 relative z-10 shrink-0">
                    <div className="relative inline-block">
                        <img src={selectedImage} alt="preview" className="w-[60px] h-[60px] rounded-lg object-cover bg-surfaceLight" />
                        <button 
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-2 -right-2 bg-[#E53E3E] rounded-full text-white p-0.5"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="flex flex-row items-center px-2 py-3 bg-surface border-t border-white/5 z-10 shrink-0">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-white transition"
                >
                    <ImageIcon className="w-6 h-6" />
                </button>
                <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageChange}
                />
                
                <input
                    type="text"
                    className="flex-1 bg-background border border-white/10 text-white rounded-full px-4 py-2.5 mx-1 outline-none focus:border-[#667eea] transition"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                />
                
                <button 
                    onClick={handleSend}
                    disabled={(!inputText.trim() && !selectedImage)}
                    className={`ml-1 w-10 h-10 rounded-full flex items-center justify-center transition
                        ${(!inputText.trim() && !selectedImage) ? 'bg-surfaceLight text-gray-500' : 'bg-[#667eea] text-white hover:bg-[#5a6ee0]'}`}
                >
                    <Send className="w-[18px] h-[18px] ml-0.5" />
                </button>
            </div>

            {/* Fullscreen Image Modal */}
            {modalImageUri && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm px-4">
                    <button 
                        onClick={() => setModalImageUri(null)}
                        className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition bg-white/5 hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img 
                        src={modalImageUri} 
                        alt="fullscreen" 
                        className="max-w-full max-h-[85vh] object-contain rounded-md"
                    />
                </div>
            )}
        </div>
    );
};

export default DisputeDetails;
