import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { getUserProfile } from '../services/user_service';
import { getTelegramUser } from '../services/telegram';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile?.isBanned) {
            await firebaseSignOut(auth);
            alert("This account has been permanently banned.");
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Capture Telegram ID if in Mini App
          const tgUser = getTelegramUser();
          if (tgUser && tgUser.id) {
            if (profile?.telegramChatId !== tgUser.id) {
               const db = getFirestore(app);
               await updateDoc(doc(db, 'users', user.uid), {
                  telegramChatId: tgUser.id
               });
            }
          }

        } catch (error) {
          console.error("Error checking ban status", error);
        }
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = () => {
    const auth = getAuth(app);
    return firebaseSignOut(auth);
  };

  const refreshUser = async () => {
    const auth = getAuth(app);
    const currentUser = auth.currentUser;
    if (currentUser) {
        await currentUser.reload();
        // Force a new object reference to trigger React State update
        const updatedUser = auth.currentUser;
        if (updatedUser) {
             // @ts-ignore
             setUser(Object.assign(Object.create(Object.getPrototypeOf(updatedUser)), updatedUser));
        }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {loading ? (
        <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[9999]">
          {/* Gradient glow behind logo */}
          <div className="absolute w-64 h-64 bg-gradient-to-br from-[#667eea]/30 to-[#764ba2]/30 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-2xl shadow-[#667eea]/30 mb-6"
              style={{ animation: 'splashFadeIn 0.8s ease-out' }}>
              <span className="text-white text-3xl font-black tracking-tight">A</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide mb-2"
              style={{ animation: 'splashFadeIn 1s ease-out 0.2s both' }}>
              ADERA
            </h1>
            <p className="text-gray-400 text-sm font-medium tracking-widest uppercase"
              style={{ animation: 'splashFadeIn 1s ease-out 0.4s both' }}>
              Secure Digital Trading
            </p>
          </div>

          {/* Loading dots */}
          <div className="relative z-10 mt-12 flex gap-1.5"
            style={{ animation: 'splashFadeIn 1s ease-out 0.6s both' }}>
            <div className="w-2 h-2 rounded-full bg-[#667eea] animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#764ba2] animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#e14fad] animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>

          <style>{`
            @keyframes splashFadeIn {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
