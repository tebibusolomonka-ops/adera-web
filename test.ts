import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBT3uvxZkoHuQ0R021xnW8qwuF2-JXSd0w",
  projectId: "socialtrade-fasil",
  storageBucket: "socialtrade-fasil.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const q = query(collection(db, 'transactions'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  console.log(`Found ${snap.size} pending transactions.`);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`- Tx: ${doc.id} | Amount: ${data.amount} | Buyer: ${data.buyerId}`);
  });
  
  process.exit(0);
}

check();
