
import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminAuthContextType {
  isAdminAuthenticated: boolean;
  currentUser: User | null;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => Promise<void>;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      // Check if user is admin (you can customize this logic)
      setIsAdminAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Admin login successful:', userCredential.user);
      return true;
    } catch (error) {
      console.error('Admin login failed:', error);
      return false;
    }
  };

  const adminLogout = async () => {
    try {
      await signOut(auth);
      console.log('Admin logout successful');
    } catch (error) {
      console.error('Admin logout failed:', error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdminAuthenticated,
      currentUser,
      adminLogin,
      adminLogout,
      loading
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
