// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyBQVA2fXqH5k2MksrrlztWdGaS4z1Qf23w",
  authDomain: "voting-65029.firebaseapp.com",
  projectId: "voting-65029",
  storageBucket: "voting-65029.appspot.com",
  messagingSenderId: "359644767360",
  appId: "1:359644767360:web:988892338bfcbebd693265",
  measurementId: "G-R4MTLCTPS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Initialize Firestore Database
export const db = getFirestore(app);  // Export Firestore instance