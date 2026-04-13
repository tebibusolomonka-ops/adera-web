import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';

export interface Transaction {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | string;
  createdAt: number;
  updatedAt?: number;
  listingDetails: {
      title: string;
      imageUrl: string;
  };
  paymentMethod?: string;
  paymentProof?: string; 
}

const TRANSACTIONS_COLLECTION = 'transactions';

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
      ...transaction,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const getTransactions = async (userId: string, role: 'buyer' | 'seller'): Promise<Transaction[]> => {
  try {
    const field = role === 'buyer' ? 'buyerId' : 'sellerId';
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    );
      
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const subscribeToTransactions = (
  userId: string,
  role: 'buyer' | 'seller',
  onUpdate: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  const field = role === 'buyer' ? 'buyerId' : 'sellerId';
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where(field, '==', userId)
  );
  
  return onSnapshot(
    q,
    (snapshot) => {
      const transactions = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
              id: docSnapshot.id,
              ...data,
              createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
              updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || 0),
          } as Transaction;
      });
      
      // Sort client-side by lasted updated or created
      const sorted = transactions.sort((a, b) => {
           const dateA = a.updatedAt || a.createdAt;
           const dateB = b.updatedAt || b.createdAt;
           return dateB - dateA;
      });
      onUpdate(sorted);
    },
    (error) => onError(error)
  );
};

export const getAllTransactions = async (status?: string): Promise<Transaction[]> => {
  try {
    let q = query(collection(db, TRANSACTIONS_COLLECTION));
    
    if (status) {
        q = query(collection(db, TRANSACTIONS_COLLECTION), where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
      
    return snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
          updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || 0),
        } as Transaction;
    }).sort((a, b) => {
        const dateA = a.updatedAt || a.createdAt;
        const dateB = b.updatedAt || b.createdAt;
        return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};

export const updateTransactionStatus = async (transactionId: string, status: string): Promise<void> => {
    try {
        const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
        await updateDoc(docRef, {
            status,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating transaction status:', error);
        throw error;
    }
};

export const subscribeToTransaction = (
  transactionId: string,
  onUpdate: (transaction: Transaction) => void,
  onError: (error: Error) => void
): (() => void) => {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
              const data = snapshot.data();
              const transaction = {
                  id: snapshot.id,
                  ...data,
                  createdAt: (data?.createdAt as any)?.toMillis ? (data?.createdAt as any).toMillis() : (data?.createdAt || Date.now()),
              } as Transaction;
              onUpdate(transaction);
          } else {
              onError(new Error("Transaction not found"));
          }
        },
        error => onError(error)
      );
  };

export const lockListingForPayment = async (
    listingId: string, 
    buyerId: string, 
    sellerId: string, 
    amount: number, 
    listingDetails: { title: string, imageUrl: string },
    sellerPayout?: number
): Promise<string> => {
    try {
        const listingRef = doc(db, 'listings', listingId);
        const transactionRef = doc(collection(db, TRANSACTIONS_COLLECTION));

        await runTransaction(db, async (t) => {
            const listingDoc = await t.get(listingRef);
            
            if (!listingDoc.exists()) {
                throw new Error("Listing does not exist.");
            }

            const listingData = listingDoc.data();
            // Check if listing is available. Allow 'active' or 'approved'.
            if (listingData?.status !== 'active' && listingData?.status !== 'approved') {
                throw new Error("This listing is no longer available.");
            }

            // 1. Update Listing Status to 'payment_pending' to lock it
            t.update(listingRef, { 
                status: 'payment_pending',
                updatedAt: serverTimestamp()
            });

            // 2. Create Transaction Record
            t.set(transactionRef, {
                id: transactionRef.id,
                buyerId,
                sellerId,
                listingId,
                amount,
                status: 'pending',
                listingDetails,
                sellerPayout: sellerPayout || amount,
                createdAt: serverTimestamp(),
            });
        });

        return transactionRef.id;

    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
};
