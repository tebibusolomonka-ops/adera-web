import { getFirestore, collection, addDoc, getDocs, doc, runTransaction, query, where, serverTimestamp } from 'firebase/firestore';
import { app } from '../firebase';

export interface Review {
  id?: string;
  buyerId: string;
  buyerName: string;
  buyerPhotoURL?: string;
  sellerId: string;
  listingId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: any;
}

const db = getFirestore(app);
const REVIEWS_COLLECTION = 'reviews';
const USERS_COLLECTION = 'users';

export const addReview = async (review: Omit<Review, 'createdAt'>) => {
  try {
    const reviewsRef = collection(db, REVIEWS_COLLECTION);
    
    // 1. Add the review document
    await addDoc(reviewsRef, {
      ...review,
      createdAt: serverTimestamp(),
    });

    // 2. Update Seller's Average Rating
    const sellerRef = doc(db, USERS_COLLECTION, review.sellerId);
    
    try {
      await runTransaction(db, async (transaction) => {
        const sellerDoc = await transaction.get(sellerRef);
        if (!sellerDoc.exists()) return;

        const data = sellerDoc.data();
        const currentRating = data?.rating || 0;
        const currentCount = data?.ratingCount || 0;

        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + review.rating) / newCount;

        transaction.update(sellerRef, {
          rating: newRating,
          ratingCount: newCount
        });
      });
    } catch (txError) {
      console.warn("Non-fatal error updating seller rating:", txError);
    }

    return true;
  } catch (error) {
    console.error("Error adding review: ", error);
    throw error;
  }
};

export const getSellerReviews = async (sellerId: string): Promise<Review[]> => {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION), where('sellerId', '==', sellerId));
    const snapshot = await getDocs(q);

    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];

    // Sort client-side to avoid needing a composite index
    return reviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching reviews: ", error);
    return [];
  }
};
