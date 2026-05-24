import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  updateProfile, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth as fbAuth, googleProvider, isFirebaseConfigured } from "../services/firebase";
import { mockDb } from "../services/mockDb";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Handle dark mode side effects
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Sync auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !fbAuth) {
      // Mock Auth Sync (Fallback)
      const user = mockDb.getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(fbAuth, (user) => {
      if (user) {
        // Construct clean user profile
        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=c0aede`
        };
        setCurrentUser(userProfile);
        // Save to mockDb as well so mock actions work with Firestore users
        mockDb.setCurrentUser(userProfile);
      } else {
        setCurrentUser(null);
        mockDb.setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login Email
  const login = async (email, password) => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      const users = mockDb.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        mockDb.setCurrentUser(user);
        setCurrentUser(user);
        setLoading(false);
        return user;
      } else {
        // Create standard mock account
        const mockUser = {
          uid: "user-" + Math.random().toString(36).substring(2, 9),
          email: email.toLowerCase(),
          displayName: email.split("@")[0],
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}&backgroundColor=b6e3f4`
        };
        mockDb.setCurrentUser(mockUser);
        setCurrentUser(mockUser);
        setLoading(false);
        return mockUser;
      }
    }

    try {
      const result = await signInWithEmailAndPassword(fbAuth, email, password);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Register Email
  const signup = async (email, password, name) => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      const mockUser = {
        uid: "user-" + Math.random().toString(36).substring(2, 9),
        email: email.toLowerCase(),
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=d1f4c9`
      };
      mockDb.setCurrentUser(mockUser);
      setCurrentUser(mockUser);
      setLoading(false);
      return mockUser;
    }

    try {
      const result = await createUserWithEmailAndPassword(fbAuth, email, password);
      await updateProfile(result.user, {
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=d1f4c9`
      });
      // Force update context user profile
      const userProfile = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: name,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=d1f4c9`
      };
      setCurrentUser(userProfile);
      mockDb.setCurrentUser(userProfile);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      // Simulate Google Login
      const mockUser = {
        uid: "user-google-" + Math.random().toString(36).substring(2, 9),
        email: "google.user@gmail.com",
        displayName: "Google User",
        photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=google&backgroundColor=ffdfbf"
      };
      mockDb.setCurrentUser(mockUser);
      setCurrentUser(mockUser);
      setLoading(false);
      return mockUser;
    }

    try {
      const result = await signInWithPopup(fbAuth, googleProvider);
      return result.user;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    if (!isFirebaseConfigured) {
      mockDb.setCurrentUser(null);
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      await signOut(fbAuth);
      setCurrentUser(null);
      mockDb.setCurrentUser(null);
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setLoading(false);
    }
  };

  // Update Profile Details
  const updateUserProfileInfo = async (displayName, photoURL) => {
    if (!currentUser) return;
    if (!isFirebaseConfigured) {
      mockDb.updateUserProfile(currentUser.uid, { displayName, photoURL });
      setCurrentUser(prev => ({ ...prev, displayName, photoURL }));
      return;
    }

    try {
      await updateProfile(fbAuth.currentUser, { displayName, photoURL });
      const updatedUser = { ...currentUser, displayName, photoURL };
      setCurrentUser(updatedUser);
      mockDb.setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Profile update failed", error);
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateUserProfileInfo,
    darkMode,
    toggleDarkMode
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
