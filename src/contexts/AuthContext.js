// Global authentication state management
// Why Context? We need user info available throughout the entire app

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Why create a context?
// - Avoids "prop drilling" - passing user data through every component
// - Centralizes authentication logic
// - Makes user state available anywhere in the app
const AuthContext = createContext();

// Custom hook for using auth context
// Why a custom hook? Makes it easier to use and provides better error messages
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up function
  // Why async? Firebase operations take time - we need to wait for them
  const signup = async (email, password, displayName) => {
    try {
      // Create Firebase auth user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile document in Firestore
      // Why separate profile? Firebase Auth has limited user info storage
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        journalCount: 0,
        settings: {
          darkMode: false,
          notifications: true
        }
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);
      
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Load user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // Listen for authentication state changes
  // Why useEffect? We want this to run when component mounts and clean up when it unmounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // User is signed in, load their profile
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    // Why cleanup? Prevents memory leaks
    return unsubscribe;
  }, []);

  // What we provide to the rest of the app
  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
