import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  followers: number;
  following: number;
  isVerified: boolean;
  verificationStatus?: 'initial' | 'pending' | 'approved' | 'rejected';
  firstName?: string;
  lastName?: string;
  phone?: string;
  age?: string;
  bank?: string;
  accountNumber?: string;
  idImageUrl?: string;
  createdAt: number;
  numericId?: string;
  isAdmin?: boolean;
  finNumber?: string;
  rating?: number;
  ratingCount?: number;
}

const USERS_COLLECTION = 'users';
const db = getFirestore(app);

export const checkFinNumberExists = async (finNumber: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('finNumber', '==', finNumber),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking FIN number:', error);
    throw error;
  }
};

export const createUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userRef, {
      uid,
      followers: 0,
      following: 0,
      isVerified: false,
      createdAt: serverTimestamp(),
      ...data,
    }, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    // @ts-ignore
    await updateDoc(userRef, data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
