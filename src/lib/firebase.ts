import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCdeOkeJqB4HnOlrXjk9_FyaVEfLE8cdNU",
  authDomain: "rotinaodonto-3e56e.firebaseapp.com",
  projectId: "rotinaodonto-3e56e",
  storageBucket: "rotinaodonto-3e56e.firebasestorage.app",
  messagingSenderId: "49562829440",
  appId: "1:49562829440:web:6fa969506e7092a63d5c65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);