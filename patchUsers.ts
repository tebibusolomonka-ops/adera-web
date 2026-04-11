import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBT3uvxZkoHuQ0R021xnW8qwuF2-JXSd0w",
  projectId: "socialtrade-fasil",
  storageBucket: "socialtrade-fasil.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function patch() {
  const snap = await getDocs(collection(db, 'users'));
  let count = 0;
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    if (!data.numericId) {
      const newNumericId = Math.floor(10000000 + Math.random() * 90000000).toString();
      await updateDoc(doc(db, 'users', userDoc.id), { numericId: newNumericId });
      console.log(`Patched user ${data.email || data.displayName || userDoc.id} with numericId ${newNumericId}`);
      count++;
    }
  }
  console.log(`Finished patching ${count} users.`);
  process.exit(0);
}

patch();
