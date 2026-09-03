import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// MAA BEST NETWORK - Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfM3xCFdTYEvl0_2l_n36SMMBkYS0nkyU",
  authDomain: "maabestnetwork.firebaseapp.com",
  projectId: "maabestnetwork",
  storageBucket: "maabestnetwork.firebasestorage.app",
  messagingSenderId: "443601022531",
  appId: "1:443601022531:web:ad104bc44cf8f6538aaef6",
  measurementId: "G-2QZXNE1LMC"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore Main Database
export const db = getFirestore(app);

// Safe Analytics stub to prevent ad-blockers from throwing ERR_BLOCKED_BY_CLIENT
export const analytics = null;
