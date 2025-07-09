import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlczJHqTDt4i-K2lUAGDrRm7sHl3_kbxY",
  authDomain: "timeline-e7c32.firebaseapp.com",
  projectId: "timeline-e7c32",
  storageBucket: "timeline-e7c32.firebasestorage.app",
  messagingSenderId: "1004343497786",
  appId: "1:1004343497786:web:56804d54145a1d6d2fd103"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);