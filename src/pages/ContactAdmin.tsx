import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, Image as ImageIcon, XCircle, Loader2, Lock, Clock, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getUserProfile } from '../services/user_service';
import { uploadToCloudinary } from '../services/cloudinary';
import { db } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    limit, 
    getDocs, 
    addDoc, 
    serverTimestamp, 
    onSnapshot, 
    orderBy, 
    updateDoc, 
    doc 
} from 'firebase/firestore';

interface Message {
  id: string;
  body: string;
  image?: string;
  sender_type: 'user' | 'admin';
  created_at: any;
}

const ContactAdmin = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string>('open');
  const [closedAt, setClosedAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // null = loading
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isClosed = ticketStatus === 'completed';

  // Check verification status
  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(profile => {
      setIsVerified(profile?.isVerified || profile?.verificationStatus === 'approved' || false);
    }).catch(() => setIsVerified(false));
  }, [user]);

  // 24h Countdown Timer
  useEffect(() => {
    if (!closedAt) return;
    
    const update = () => {
      const now = new Date();
      const expiresAt = new Date(closedAt.getTime() + 24 * 60 * 60 * 1000);
      const diff = expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Expired');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${hours}h ${minutes}m ${seconds}s`);
    };

    update(); // Run immediately
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [closedAt]);

  useEffect(() => {
    if (!user || isVerified !== true) return;

    let cleanupFns: (() => void)[] = [];

    const initTicket = async () => {
        try {
            const ticketsRef = collection(db, 'support_tickets');

            // PRIORITY 1: Check for a recently completed ticket (within 24h)
            const qCompleted = query(ticketsRef, where('userId', '==', user.uid), where('status', '==', 'completed'), limit(1));
            const completedSnap = await getDocs(qCompleted);
            
            if (!completedSnap.empty) {
                const completedData = completedSnap.docs[0].data();
                const closedTime = completedData.closedAt?.toDate ? completedData.closedAt.toDate() : null;
                
                // Still within 24 hours? Show the closed screen
                if (closedTime && (Date.now() - closedTime.getTime()) < 24 * 60 * 60 * 1000) {
                    setTicketId(completedSnap.docs[0].id);
                    setTicketStatus('completed');
                    setClosedAt(closedTime);
                    setLoading(false);

                    // Still listen for status changes (in case admin re-opens)
                    const ticketDocRef = doc(db, 'support_tickets', completedSnap.docs[0].id);
                    const unsubTicket = onSnapshot(ticketDocRef, (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setTicketStatus(data.status || 'open');
                            if (data.status === 'completed' && data.closedAt) {
                                const t = data.closedAt.toDate ? data.closedAt.toDate() : new Date(data.closedAt);
                                setClosedAt(t);
                            }
                        }
                    });
                    cleanupFns.push(unsubTicket);
                    return;
                }
                // If expired, fall through to create new ticket
            }

            // PRIORITY 2: Check for existing open ticket
            const qOpen = query(ticketsRef, where('userId', '==', user.uid), where('status', 'in', ['open', 'pending']), limit(1));
            const snapshot = await getDocs(qOpen);

            let docId = null;

            if (!snapshot.empty) {
                docId = snapshot.docs[0].id;
                const ticketData = snapshot.docs[0].data();
                setTicketStatus(ticketData.status || 'open');
            } else {
                // PRIORITY 3: Create new ticket
                const newDoc = await addDoc(ticketsRef, {
                    userId: user.uid,
                    userEmail: user.email,
                    userName: user.displayName || 'User',
                    subject: 'Direct Support',
                    status: 'open',
                    createdAt: serverTimestamp(),
                    lastMessage: null,
                    lastUpdated: serverTimestamp(),
                });
                docId = newDoc.id;
            }

            setTicketId(docId);

            // Listen for messages
            const messagesRef = collection(db, 'support_tickets', docId, 'messages');
            const msgQuery = query(messagesRef, orderBy('created_at', 'asc'));
            
            const unsubMessages = onSnapshot(msgQuery, (msgSnapshot) => {
                const items = msgSnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                })) as Message[];
                
                setMessages(items);
                setLoading(false);
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }, err => {
                console.error("Message listener error", err);
                setLoading(false);
            });
            cleanupFns.push(unsubMessages);

            // Listen for ticket status changes (admin closes it)
            const ticketDocRef = doc(db, 'support_tickets', docId);
            const unsubTicket = onSnapshot(ticketDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTicketStatus(data.status || 'open');
                    if (data.status === 'completed' && data.closedAt) {
                        const closedTime = data.closedAt.toDate ? data.closedAt.toDate() : new Date(data.closedAt);
                        setClosedAt(closedTime);
                    }
                }
            });
            cleanupFns.push(unsubTicket);

        } catch (error) {
            console.error('Init Ticket Error:', error);
            setLoading(false);
        }
    };

    initTicket();

    return () => {
        cleanupFns.forEach(fn => fn());
    };
  }, [user, isVerified]);

  // If not verified, show gate screen
  if (isVerified === false) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-background">
        <div className="flex items-center px-4 py-4 border-b border-white/10 bg-surface z-10 shrink-0 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
          <div className="flex flex-col flex-1 mx-2">
              <h1 className="text-lg font-bold text-white leading-tight">Contact Admin</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <div className="w-20 h-20 rounded-full bg-[#E53E3E]/15 flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-10 h-10 text-[#E53E3E]" />
            </div>
            <h2 className="text-[22px] font-bold text-white mb-2">Verification Required</h2>
            <p className="text-[14px] text-gray-400 mb-8 leading-relaxed">
              You need to be a verified user to access customer support. Please verify your identity first.
            </p>
            <button
              onClick={() => navigate('/verify')}
              className="w-full py-3.5 bg-[#667eea] text-white rounded-xl font-bold text-[15px] hover:bg-[#5a6ee0] transition shadow-lg shadow-[#667eea]/20 mb-3"
            >
              Verify Now
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white text-[14px] font-medium transition"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Still loading verification status
  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
      </div>
    );
  }

  const handleSend = async () => {
      if ((!inputText.trim() && !selectedImage) || !ticketId || !user || isClosed) return;

      setSending(true);
      const text = inputText.trim();
      
      const originalImage = selectedImage;
      
      setInputText('');
      setSelectedImage(null);

      try {
          let uploadedImageUrl = null;
          if (originalImage) {
              uploadedImageUrl = await uploadToCloudinary(originalImage);
          }

          const messagesRef = collection(db, 'support_tickets', ticketId, 'messages');
          await addDoc(messagesRef, {
              body: text,
              image: uploadedImageUrl,
              sender_type: 'user',
              created_at: serverTimestamp(),
          });

          const ticketRef = doc(db, 'support_tickets', ticketId);
          await updateDoc(ticketRef, {
              lastMessage: text || 'Image',
              lastUpdated: serverTimestamp(),
          });
          
          setTimeout(() => {
             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
      } catch (error: any) {
          showToast(error.message || 'Failed to send message.', 'error');
          console.error(error);
      } finally {
          setSending(false);
      }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          
          if (file.size > 10 * 1024 * 1024) {
              showToast("Image Too Large. Please use an image under 10MB.", "error");
              return;
          }

          const reader = new FileReader();
          reader.onload = (event) => {
              setSelectedImage(event.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const renderMessage = (item: Message) => {
      const isMe = item.sender_type === 'user';
      
      let timeString = '...';
      if (item.created_at) {
          const date = item.created_at?.toDate ? item.created_at.toDate() : new Date(item.created_at);
          timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return (
          <div key={item.id} className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMe ? 'bg-[#667eea] rounded-tr-sm' : 'bg-surface border border-white/10 rounded-tl-sm'}`}>
                  {!isMe && <div className="text-[10px] font-bold text-gray-400 mb-1">Admin</div>}
                  {item.image && (
                      <img src={item.image} alt="attached" className="max-w-[200px] rounded-lg mb-2 object-cover" />
                  )}
                  {item.body && (
                      <p className={`text-[15px] leading-snug break-words ${isMe ? 'text-white' : 'text-gray-200'}`}>
                          {item.body}
                      </p>
                  )}
                  <div className={`text-[10px] text-right mt-1 ${isMe ? 'text-white/70' : 'text-gray-500'}`}>
                      {timeString}
                  </div>
              </div>
          </div>
      );
  };

  // ===== CLOSED SCREEN (full-page) =====
  if (isClosed && !loading) {
    return (
      <div className="flex flex-col min-h-screen h-screen bg-background">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b border-white/10 bg-surface z-10 shrink-0 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
            <ChevronLeft className="w-7 h-7 text-white" />
          </button>
          <div className="flex flex-col flex-1 mx-2">
              <h1 className="text-lg font-bold text-white leading-tight">Contact Admin</h1>
              <span className="text-xs text-gray-400">Support ticket closed</span>
          </div>
        </div>

        {/* Centered Closed Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-[#667eea]/15 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-10 h-10 text-[#667eea]" />
            </div>
            <h2 className="text-[22px] font-bold text-white mb-2">Chat Closed by Admin</h2>
            <p className="text-[14px] text-gray-400 mb-8 leading-relaxed max-w-xs mx-auto">
              This support ticket has been resolved and closed. A new chat will be available after the cooldown period.
            </p>

            {countdown && countdown !== 'Expired' && (
              <div className="inline-flex items-center gap-2.5 bg-surface rounded-2xl py-3.5 px-6 border border-white/5 mb-8 shadow-sm">
                <Clock className="w-5 h-5 text-[#667eea] shrink-0" />
                <span className="text-[18px] font-mono font-bold text-[#667eea]">{countdown}</span>
                <span className="text-[12px] text-gray-500">remaining</span>
              </div>
            )}

            {countdown === 'Expired' && (
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3.5 bg-[#667eea] text-white rounded-xl font-bold text-[15px] hover:bg-[#5a6ee0] transition shadow-lg shadow-[#667eea]/20 mb-8"
              >
                Start New Chat
              </button>
            )}

            <div className="block">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-400 hover:text-white text-[14px] font-medium transition"
              >
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== NORMAL CHAT SCREEN =====
  return (
    <div className="flex flex-col min-h-screen h-screen bg-background relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-surface z-10 shrink-0 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
          <ChevronLeft className="w-7 h-7 text-white" />
        </button>
        <div className="flex flex-col flex-1 mx-2">
            <h1 className="text-lg font-bold text-white leading-tight">Contact Admin</h1>
            <span className="text-xs text-gray-400">Direct communication with support</span>
        </div>
        <div className="flex items-center bg-[#22543D]/30 border border-[#48BB78]/20 px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#48BB78] mr-1.5 animate-pulse"></div>
            <span className="text-[10px] font-bold text-[#68D391]">Online</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto p-4 custom-scrollbar">
          {loading ? (
              <div className="flex h-full items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#667eea] animate-spin" />
              </div>
          ) : (
              <>
                <div className="text-center mb-6 text-xs text-gray-500 font-medium bg-black/20 py-2 rounded-xl border border-white/5 mt-2">
                    Start of conversation with Support
                </div>
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} className="h-2" />
              </>
          )}
      </div>

      {/* Input Area */}
      <div className="w-full bg-surface border-t border-white/10 shrink-0 z-10">
          <div className="max-w-2xl mx-auto">
              
              {/* Image Preview */}
              {selectedImage && (
                  <div className="relative p-3 border-b border-white/5 flex items-center bg-black/20">
                      <img src={selectedImage} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-white/10 shadow-sm" />
                      <button 
                          onClick={() => setSelectedImage(null)}
                          className="absolute bottom-2 left-14 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                      >
                          <XCircle className="w-5 h-5" />
                      </button>
                  </div>
              )}

              {/* Chat Input */}
              <div className="flex items-end p-3 gap-2">
                  <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImagePick}
                  />
                  <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-surfaceLight rounded-full hover:bg-white/10 transition shrink-0 self-center"
                  >
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                  </button>
                  
                  <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 max-h-[120px] min-h-[48px] bg-background border border-white/5 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#667eea]/50 transition-colors resize-none overflow-y-auto"
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                          }
                      }}
                  />
                  
                  <button 
                      onClick={handleSend}
                      disabled={sending || (!inputText.trim() && !selectedImage)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 self-center transition-all ${
                          (inputText.trim() || selectedImage) && !sending
                              ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white hover:opacity-90 shadow-lg' 
                              : 'bg-surfaceLight text-gray-500 cursor-not-allowed'
                      }`}
                  >
                      {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-0.5 mt-0.5" />}
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
