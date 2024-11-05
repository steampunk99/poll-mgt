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
import { toast } from 'react-toastify'; // Import toast

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
    toast.error("Failed to save user role.");
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
    toast.error("Failed to fetch user role.");
    throw error;
  }
};

// Register with Email
export const registerWithEmail = async (email, password, navigate) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await saveUserRole(user); // Save role as 'voter'
    toast.success("Registration successful!");
    navigate('/dashboard/voter');
    return user;
  } catch (error) {
    console.error("Error during registration:", error);
    toast.error(error.message || "Registration failed.");
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
      toast.success("Logged in as Admin!");
      navigate('/dashboard/admin');
    } else {
      toast.success("Logged in successfully!");
      navigate('/dashboard/voter');
    }

    return user;
  } catch (error) {
    console.error("Error during email login: ", error);
    toast.error(error.message || "Login failed.");
    throw error;
  }
};

// Google Login (with role-based redirection)
export const loginWithGoogle = async (navigate) => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    let role = await fetchUserRole(user);
    if (!role) {
      // Save the default role if it's a new user
      await saveUserRole(user);
      role = 'voter';
    }

    if (role === 'admin') {
      toast.success("Logged in as Admin with Google!");
      navigate('/dashboard/admin');
    } else {
      toast.success("Logged in with Google!");
      navigate('/dashboard/voter');
    }

    return user;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    toast.error(error.message || "Google sign-in failed.");
    throw error;
  }
};

// Apple Login (with role-based redirection)
export const loginWithApple = async (navigate) => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    
    let role = await fetchUserRole(user);
    if (!role) {
      // Save the default role if it's a new user
      await saveUserRole(user);
      role = 'voter'; // Default for new users
    }

    if (role === 'admin') {
      toast.success("Logged in as Admin with Apple!");
      navigate('/dashboard/admin');
    } else {
      toast.success("Logged in with Apple!");
      navigate('/dashboard/voter');
    }

    return user;
  } catch (error) {
    console.error("Error during Apple sign-in:", error);
    toast.error(error.message || "Apple sign-in failed.");
    throw error;
  }
};

// Logout
export const logout = async () => {
  try {
    await auth.signOut();
    console.log("User logged out");
    toast.success("Logged out successfully!");
  } catch (error) {
    console.error("Error during logout: ", error);
    toast.error("Logout failed.");
    throw error;
  }
};
