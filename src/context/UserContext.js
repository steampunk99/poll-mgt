import React, { createContext, useState, useContext, useEffect } from 'react'
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, getDocs, addDoc, collection, query, where, updateDoc, setDoc, deleteDoc } from "firebase/firestore"
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updatePassword, 
  updateEmail, 
  signOut,
  deleteUser as deleteAuthUser,
  signInWithEmailAndPassword
} from "firebase/auth"
import { Toast } from '@/components/ui/toast'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usersList, setUsersList] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid)
        const userDoc = await getDoc(userDocRef)
  
        if (userDoc.exists()) {
          setUser({ ...firebaseUser, ...userDoc.data() })
        } else {
          setUser(firebaseUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })
  
    return () => unsubscribe()
  }, [])

  const logUserAction = async (userId, action, details = {}) => {
    try {
      await addDoc(collection(db, 'auditLogs'), {
        userId,
        action,
        timestamp: new Date(),
        details
      });
    } catch (err) {
      console.error("Error logging user action:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, "users")
      const usersSnapshot = await  getDocs(usersCollection)
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setUsersList(usersData)
    } catch (error) {
      console.error("Error fetching users:", error)
      setError("Failed to fetch users.")
    }
  }

  const updateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, { role: newRole })
      await logUserAction(user?.uid, 'update_user_role', { userId, newRole });
      fetchUsers()
    } catch (error) {
      console.error("Error updating user role:", error)
      setError("Failed to update user role.")
    }
  }

  const toggleUserActivation = async (userId, isActive) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, { isActive: !isActive })
      await logUserAction(user?.uid, 'toggle_user_activation', { userId, isActive });
      fetchUsers()
    } catch (error) {
      console.error("Error changing user status:", error)
      setError("Failed to change user status.")
    }
  }

  const addUser = async (email, password, role) => {
    try {
      // Store the current user's authentication
      const currentUser = auth.currentUser
      
      // Sign out the current user
      await signOut(auth)

      // Create new user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user

      // Add new user to Firestore
      const userRef = doc(db, "users", newUser.uid)
      await setDoc(userRef, {
        email,
        role,
        isActive: true
      })

      // Log the action
      await logUserAction(currentUser.uid, 'add_user', { email, role });

      // Sign out the new user
      await signOut(auth)

      // Sign back in the original user
      await signInWithEmailAndPassword(auth, currentUser.email, currentUser.password)

      // Fetch updated user list
      fetchUsers()

      Toast({
        title: "User added successfully",
        description: `New ${role} account created for ${email}`,
      })
    } catch (error) {
      console.error("Error adding new user:", error)
      setError("Failed to add new user.")
      Toast({
        title: "Error adding user",
        description: error.message,
        variant: "destructive",
      })
      throw error
    }
  }
  const deleteUser = async (userId) => {
    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, "users", userId))

      // Delete user from Firebase Auth
      const userToDelete = auth.currentUser
      if (userToDelete && userToDelete.uid === userId) {
        await deleteAuthUser(userToDelete)
        await logUserAction(user?.uid, 'delete_user', { userId });
      }

      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      setError("Failed to delete user.")
      throw error
    }
  }

  const updateUserProfile = async (userId, updateData) => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, updateData)
      await logUserAction(userId, 'update_profile', updateData);
      if (user && user.uid === userId) {
        setUser(prevUser => ({ ...prevUser, ...updateData }))
      }
    } catch (error) {
      console.error("Error updating user profile:", error)
      setError("Failed to update user profile.")
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      await logUserAction(user?.uid, 'reset_password', { email });
    } catch (error) {
      console.error("Error resetting password:", error)
      setError("Failed to reset password.")
      throw error
    }
  }

  const changeEmail = async (newEmail) => {
    try {
      await updateEmail(auth.currentUser, newEmail)
      await updateUserProfile(auth.currentUser.uid, { email: newEmail })
      await logUserAction(auth.currentUser.uid, 'change_email', { newEmail });
    } catch (error) {
      console.error("Error changing email:", error)
      setError("Failed to change email.")
      throw error
    }
  }

  const changePassword = async (newPassword) => {
    try {
      await updatePassword(auth.currentUser, newPassword)
      await logUserAction(auth.currentUser.uid, 'change_password');
    } catch (error) {
      console.error("Error changing password:", error)
      setError("Failed to change password.")
      throw error
    }
  }

  const searchUsers = async (searchTerm) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", ">=", searchTerm), where("email", "<=", searchTerm + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error searching users:", error)
      setError("Failed to search users.")
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid))
      if (userDoc.exists()) {
        setUser({ ...userCredential.user, ...userDoc.data() })
      } else {
        setUser(userCredential.user)
      }
    } catch (error) {
      console.error("Error signing in:", error)
      setError("Failed to sign in.")
      throw error
    }
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      usersList, 
      error,
      fetchUsers, 
      updateUserRole, 
      toggleUserActivation, 
      addUser,
      deleteUser,
      updateUserProfile,
      resetPassword,
      changeEmail,
      changePassword,
      searchUsers,
      signIn
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)