import { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info,
  BellOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserNotifications, markNotificationAsRead } from '../services/notification_service';
import type { Notification } from '../services/notification_service';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePress = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
        await markNotificationAsRead(notification.id);
    }

    const { title, relatedId } = notification;

    // 1. Listings
    if (title.includes("Listing Approved") || title.includes("Listing Rejected")) {
        navigate('/my-sales'); // Or standard inventory
        return;
    }

    // 2. Item Sold (Seller Action Required)
    if (title.includes("Item Sold") || title.includes("Credentials")) {
        if (relatedId) {
             navigate(`/sales/${relatedId}`);
        } else {
             navigate('/my-sales');
        }
        return;
    }

    // 3. Purchases
    if (title.includes("Payment Approved") || title.includes("Purchase")) {
        navigate('/my-purchases');
        return;
    }

    // 4. Payment to Seller
    if (title.includes("Payment Released") || title.includes("Paid")) {
        navigate('/transaction'); 
        return;
    }

    // 5. Verification
    if (title.includes("Verification")) {
        navigate('/profile');
        return;
    }

    // 6. Disputes
    if (title.includes("Dispute")) {
        navigate('/transaction'); 
        return;
    }
    
    // Default
    navigate('/');
  };

  const renderItem = (item: Notification) => {
    const isSuccess = item.type === 'success';
    const isWarning = item.type === 'warning';
    const isError = item.type === 'error';
    
    // Lucide Icons
    let IconComp = Info;
    let iconColor = 'text-blue-500';
    if (isSuccess) { IconComp = CheckCircle; iconColor = 'text-green-500'; }
    if (isWarning) { IconComp = AlertCircle; iconColor = 'text-orange-500'; }
    if (isError) { IconComp = XCircle; iconColor = 'text-red-500'; }

    return (
      <div 
        key={item.id}
        onClick={() => handlePress(item)}
        className={`flex flex-row p-4 rounded-xl mb-3 items-start border border-white/5 shadow-sm hover:opacity-80 transition-all cursor-pointer ${item.read ? 'bg-background opacity-70' : 'bg-surface'}`}
      >
        <div className="mr-3 mt-0.5">
             <IconComp className={`w-7 h-7 ${iconColor}`} />
        </div>
        <div className="flex-1">
            <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
            <p className="text-sm leading-relaxed text-gray-400 mb-2 line-clamp-3">{item.message}</p>
            <span className="text-[11px] text-gray-500">
                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>
        {!item.read && <div className="w-2.5 h-2.5 rounded-full bg-red-500 ml-2 mt-1.5 shrink-0" />}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-[60px] border-b border-white/5 sticky top-0 z-10 bg-background/80 backdrop-blur">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition">
           <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-lg font-bold text-white pr-8">Notifications</span>
        <div className="w-[1px]" />
      </div>

      {loading ? (
        <div className="flex flex-1 justify-center items-center mt-[20vh]">
          <div className="w-8 h-8 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="p-4 pb-20">
          {notifications.length > 0 ? (
            notifications.map(renderItem)
          ) : (
            <div className="flex flex-col items-center justify-center mt-12 opacity-70">
               <BellOff className="w-12 h-12 text-gray-500 mb-2" />
               <span className="text-base text-gray-400 mt-2">No notifications yet.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
