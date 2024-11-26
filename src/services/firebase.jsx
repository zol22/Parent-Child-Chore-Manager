import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFvKVi5XSZe6CokfWiQZTw0QrUReml8c0",
  authDomain: "parent-child-chore-manager.firebaseapp.com",
  projectId: "parent-child-chore-manager",
  storageBucket: "parent-child-chore-manager.firebasestorage.app",
  messagingSenderId: "236146937873",
  appId: "1:236146937873:web:6824e1dca2c6ec6e3ee1b0",
measurementId: "G-2GFJF3ESN6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app); // For authentication
export const db = getFirestore(app); // For database
