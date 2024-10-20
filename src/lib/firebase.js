// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  // apiKey: "AIzaSyBQVA2fXqH5k2MksrrlztWdGaS4z1Qf23w",
  // authDomain: "voting-65029.firebaseapp.com",
  // projectId: "voting-65029",
  // storageBucket: "voting-65029.appspot.com",
  // messagingSenderId: "359644767360",
  // appId: "1:359644767360:web:988892338bfcbebd693265",
  // measurementId: "G-R4MTLCTPS7"
  apiKey: "AIzaSyCv9KcpRP2vPhvYgx0Iadt2MbPZLaT-wqo",
  authDomain: "voting-26070.firebaseapp.com",
  projectId: "voting-26070",
  storageBucket: "voting-26070.appspot.com",
  messagingSenderId: "660688866117",
  appId: "1:660688866117:web:d342533f1f9fe91b2a8c2c",
  measurementId: "G-2JYJEM27FL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Initialize Firestore Database
export const db = getFirestore(app);  // Export Firestore instance