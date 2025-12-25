import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, increment, runTransaction, query, orderBy, limit, collection, getDocs, updateDoc } from "firebase/firestore";

// It's good practice to define the shape of your objects.
interface AuthUser {
  uid: string;
  email: string | null; // email from firebase auth can be null
}

export interface UserProfile {
  uid: string;
  email: string | null;
  level: number;
  matchesPlayed: number;
  wins: number;
  balance: number;
  displayName?: string;
  photoURL?: string;    // 🆕 Add this new optional field
}

// 1. Get (or Create) User Profile
export const getUserProfile = async (user: AuthUser) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  } else {
    // If user doesn't exist yet, create a default "Beginner" profile
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      level: 1.0, // Starting Level
      matchesPlayed: 0,
      wins: 0,
      balance: 2000 // Starting Balance
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
};

// This function creates a user profile, typically during sign-up.
export const createUserProfile = async (user: AuthUser) => {
  const userRef = doc(db, "users", user.uid);
  
  const newProfile: UserProfile = {
    uid: user.uid,
    email: user.email,
    level: 1.0, // Default starting level
    matchesPlayed: 0,
    wins: 0,
    balance: 2000
  };
  
  // setDoc will create or overwrite the document.
  await setDoc(userRef, newProfile);
  return newProfile;
};

// 🏆 Get Global Leaderboard
export const getLeaderboard = async () => {
  const q = query(
    collection(db, "users"),
    orderBy("level", "desc"), // Highest level first
    limit(20) // Top 20 players
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    ...doc.data(), 
    // Handle case where name might be missing (use email part)
    displayName: doc.data().displayName || doc.data().email?.split('@')[0] || "Unknown" 
  } as UserProfile & { displayName: string }));
};

// 🏧 Top Up Wallet
export const topUpBalance = async (userId: string, amount: number) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    balance: increment(amount)
  });
};

// ✏️ Update Profile Data
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
};