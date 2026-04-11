import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword as firebaseUpdatePassword,
  sendEmailVerification
} from 'firebase/auth';
import type { User, UserCredential } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Send verification email
  await sendEmailVerification(credential.user);
  return credential;
};

export const resendVerificationEmail = async (): Promise<void> => {
  const user = auth.currentUser;
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
};

export const signOut = async (): Promise<void> => {
  return await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void,
) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export const reauthenticate = async (password: string): Promise<void> => {
  const user = auth.currentUser;
  if (user && user.email) {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
  } else {
      throw new Error("No user signed in");
  }
};

export const updatePassword = async (newPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (user) {
      await firebaseUpdatePassword(user, newPassword);
  } else {
      throw new Error("No user signed in");
  }
};
