import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";

// Google and Apple providers for OAuth
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider("apple.com");


// Save user with default role 'voter' in Firestore
const saveUserRole = async (user, role = 'voter') => {
  try {
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: role,   // Default to 'voter'
      displayName: user.displayName || "Anonymous",
      createdAt: new Date(),
    });
    console.log("User data saved with role:", role);
  } catch (error) {
    console.error("Error saving user role: ", error);
  }
};

// Fetch user role from Firestore
const fetchUserRole = async (user) => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role; // Return the user's role
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role: ", error);
    throw error;
  }
};

// Register with Email
export const registerWithEmail = async (email, password, navigate) => {
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await saveUserRole(user); // Save role as 'voter'
    navigate('/dashboard/voter');
    return user;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

// Login with Email (with role-based redirection)
export const loginWithEmail = async (email, password, navigate) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Fetch the user's role and navigate accordingly
    const role = await fetchUserRole(user);
    
    if (role === 'admin') {
      navigate('/dashboard/admin');
    } else {
      navigate('/dashboard/voter');
    }

    return user;
  } catch (error) {
    console.error("Error during email login: ", error);
    throw error;
  }
};

// Google Login (with role-based redirection)
export const loginWithGoogle = async (navigate) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    const role = await fetchUserRole(user);
    if (!role) {
      // Save the default role if it's a new user
      await saveUserRole(user);
      navigate(role === 'admin' ? '/dashboard/admin' : '/dashboard/voter');
    } else {
      navigate(role === 'admin' ? '/dashboard/admin' : '/dashboard/voter');
    }

    return user;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};

// Apple Login (with role-based redirection)
export const loginWithApple = async (navigate) => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    
    const role = await fetchUserRole(user);
    if (!role) {
      // Save the default role if it's a new user
      await saveUserRole(user);
      navigate('/dashboard/voter'); // Default for new users
    } else {
      navigate(role === 'admin' ? '/dashboard/admin' : '/dashboard/voter');
    }

    return user;
  } catch (error) {
    console.error("Error during Apple sign-in:", error);
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await auth.signOut();
    console.log("User logged out");
  } catch (error) {
    console.error("Error during logout: ", error);
    throw error;
  }
};
