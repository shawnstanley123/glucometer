// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../backend/firebaseConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const userRole = await fetchUserRole(authUser.uid);
    
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserRole = async (userId) => {
   

    try {
     
      const userDoc = await getDoc(doc(FIRESTORE_DB, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || null;
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.log('Error getting document:', error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
