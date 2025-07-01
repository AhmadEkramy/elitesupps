// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9TyGwZ4__vmvYvMBhAh6O27kL1zEteAI",
  authDomain: "elite-supps-787d6.firebaseapp.com",
  projectId: "elite-supps-787d6",
  storageBucket: "elite-supps-787d6.firebasestorage.app",
  messagingSenderId: "155781426569",
  appId: "1:155781426569:web:998e36b93e93daa9d5c558",
  measurementId: "G-NDLV77J22H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;