import { getFirestore, collection, addDoc, doc, updateDoc, query, where, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { app, auth } from '../firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedId?: string; 
  read: boolean;
  createdAt: number;
}

const NOTIFICATIONS_COLLECTION = 'notifications';
const db = getFirestore(app);

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  relatedId?: string
) => {
  try {
    const notificationsRef = collection(db, NOTIFICATIONS_COLLECTION);
    await addDoc(notificationsRef, {
      userId,
      title,
      message,
      type,
      relatedId: relatedId || null,
      read: false,
      createdAt: serverTimestamp(),
    });

    // --- SECURE TELEGRAM BOT FORWARDING ---
    try {
       const userSnap = await getDoc(doc(db, 'users', userId));
       if (userSnap.exists()) {
           const userData = userSnap.data();
           const currentUser = auth.currentUser;

           if (userData.telegramChatId && currentUser) {
               // Get the ID Token to prove identity to our Vercel Backend
               const idToken = await currentUser.getIdToken();
               const telegramMessage = `🔔 *${title}*\n\n${message}`;
               
               fetch(`/api/telegram`, {
                   method: 'POST',
                   headers: { 
                       'Content-Type': 'application/json',
                       'Authorization': `Bearer ${idToken}` 
                   },
                   body: JSON.stringify({
                       chat_id: userData.telegramChatId,
                       text: telegramMessage
                   })
               }).catch(e => console.error("Secure API Error:", e));
           }
       }
    } catch (e) {
        console.error("Error looking up telegram ID:", e);
    }

  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export const getUserNotifications = (
  userId: string,
  onUpdate: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now()
        } as Notification;
      });
      
      // Client-side sort
      notifications.sort((a, b) => b.createdAt - a.createdAt);
      
      onUpdate(notifications);
    },
    (error) => {
      console.error('Error fetching notifications:', error);
    }
  );
};
