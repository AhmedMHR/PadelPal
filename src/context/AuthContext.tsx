'use client';
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// 1. Define the User type with a'g'g 'export'
export interface User {
    uid: string;
    email: string | null;
    name: string;
    level: number;
    wins: number;
    balance: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            // If we have a Firebase user, fetch the full user profile from Firestore
            const userRef = doc(db, "users", firebaseUser.uid);
            const unsubscribeSnapshot = onSnapshot(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        ...snapshot.data()
                    } as User);
                } else {
                    // Handle case where user is authenticated but not in Firestore
                    // This might happen on first login before the user document is created
                    console.log("User not found in Firestore, might be first login.");
                    setUser(null);
                }
                setLoading(false);
            });

            return () => unsubscribeSnapshot();
        } else {
            // No user is signed in
            setUser(null);
            setLoading(false);
        }
    });

    return () => unsubscribeAuth();
}, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
