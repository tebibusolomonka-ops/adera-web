import { getFirestore, collection, addDoc, getDoc, getDocs, doc, query, where, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { app } from '../firebase';

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  image_url: string;
  category: string;
  sellerId: string;
  seller?: {
      id: string;
      name: string;
      avatar: string;
      rating: number;
  };
  rating: number;
  reviews: number;
  createdAt: number;
  level?: number;
  follower_count?: string | number;
  status?: 'pending' | 'active' | 'approved' | 'sold' | 'rejected' | 'payment_pending';
  views?: number;
  likes?: number;
  
  // Specific Fields
  socialPlatform?: string;
  socialUsername?: string;
  isMonetized?: 'yes' | 'no' | null;
  gameName?: string;
  rank?: string;
  accountLevel?: string;
  playtime?: string;
  additionalImages?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

const LISTINGS_COLLECTION = 'listings';
const CATEGORIES_COLLECTION = 'categories';
const db = getFirestore(app);

export const createListing = async (listing: Omit<Listing, 'id' | 'createdAt' | 'rating' | 'reviews'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), {
      ...listing,
      rating: 0,
      reviews: 0,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating listing:', error);
    throw error;
  }
};

export const getListings = async (category?: string): Promise<Listing[]> => {
  try {
    let q = query(collection(db, LISTINGS_COLLECTION));
    
    if (category) {
      q = query(q, where('category', '==', category));
    }

    q = query(q, where('status', 'in', ['active', 'approved']));

    const snapshot = await getDocs(q);
    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Listing));

    return listings.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting listings:', error);
    throw error;
  }
};

export const subscribeToListings = (
  onUpdate: (listings: Listing[]) => void,
  onError: (error: Error) => void,
  category?: string
): Unsubscribe => {
  let q = query(collection(db, LISTINGS_COLLECTION));
  
  if (category) {
    q = query(q, where('category', '==', category));
  }

  q = query(q, where('status', 'in', ['active', 'approved']));

  return onSnapshot(q, 
    (snapshot) => {
      const listings = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          image_url: data.image_url || data.imageUrl || '',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
        } as Listing;
      });
      
      const sorted = listings.sort((a, b) => b.createdAt - a.createdAt);
      onUpdate(sorted);
    },
    (error) => onError(error)
  );
};

export const getListing = async (id: string): Promise<Listing | null> => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        image_url: data.image_url || data.imageUrl || '',
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
      } as Listing;
    }
    return null;
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
};

export const getSellerListings = async (sellerId: string): Promise<Listing[]> => {
  try {
    const q = query(
      collection(db, LISTINGS_COLLECTION),
      where('sellerId', '==', sellerId)
    );
    const snapshot = await getDocs(q);

    const listings = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
            id: doc.id, 
            ...data,
            image_url: data.image_url || data.imageUrl || '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
        } as Listing;
    });
    
    return listings.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting seller listings:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const snapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Category));
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};
