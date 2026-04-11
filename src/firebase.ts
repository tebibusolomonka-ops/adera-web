import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBT3uvxZkoHuQ0R021xnW8qwuF2-JXSd0w",
  projectId: "socialtrade-fasil",
  storageBucket: "socialtrade-fasil.firebasestorage.app",
  appId: "1:13469984953:web:placeholder_we_can_use_generic_if_needed", // A web app id usually has :web: 
  // We can omit appId if we don't strictly need it, but auth sometimes requires it. We'll find out. Just using the core ones from mobile.
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
