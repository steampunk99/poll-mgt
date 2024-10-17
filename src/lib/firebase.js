// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAyApjv2q6EV2tsYQ3bfaju0pSJCZKC5so",
  authDomain: "voting-29899.firebaseapp.com",
  projectId: "voting-29899",
  storageBucket: "voting-29899.appspot.com",
  messagingSenderId: "399432590493",
  appId: "1:399432590493:web:3d87e8ce0b9ae4f7762074",
  measurementId: "G-68NGDRC5VP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Initialize Firestore Database
export const db = getFirestore(app);  // Export Firestore instance