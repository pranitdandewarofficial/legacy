// Firebase Configuration
// Note: Replace with your actual Firebase config for production
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDemo_Replace_With_Your_Key",
  authDomain: "legacy-win.firebaseapp.com",
  projectId: "legacy-win",
  storageBucket: "legacy-win.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase (will work in demo mode if config is invalid)
let app: any = null;
let auth: any = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (e) {
  console.warn('Firebase init failed, using demo mode');
}

export { auth, app };
export { signInWithPhoneNumber, RecaptchaVerifier, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged };
