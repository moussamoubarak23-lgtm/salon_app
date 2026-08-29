import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBXSl1L860aW_mxdXJA8lskvdgl75dYX_k",
  authDomain: "salon-app-d0015.firebaseapp.com",
  projectId: "salon-app-d0015",
  storageBucket: "salon-app-d0015.firebasestorage.app",
  messagingSenderId: "501006099637",
  appId: "1:501006099637:web:1ce064d976071fb13a0afc",
  measurementId: "G-FQ25R912VP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const messaging = typeof window !== "undefined" ? getMessaging(app) : null;
