import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, doc, updateDoc, arrayUnion, getDoc, limit, runTransaction, arrayRemove, deleteDoc } from "firebase/firestore";

export interface Booking {
  id?: string;
  venueId: string;
  courtName: string;
  date: string; 
  startTime: string;
  createdAt: any;
  
  // Open Match Fields
  type: 'private' | 'open';
  hostId: string;
  players: string[];
  level: number;
  pricePerPlayer: number;
  status: 'open' | 'full' | 'cancelled' | 'finished';
  
  // Scoring Fields
  score?: string;
  winners?: string[];
}

// 🗓️ Generate 90-min slots
export const generateTimeSlots = () => {
  const slots = [];
  let startHour = 8; 
  let startMin = 0;
  while (startHour < 23) {
    const timeString = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
    slots.push(timeString);
    startMin += 30;
    if (startMin >= 60) {
      startMin -= 60;
      startHour += 1;
    }
    startHour += 1;
  }
  return slots;
};

// 🔍 Check taken slots
export const getBookedSlots = async (venueId: string, date: string) => {
  const q = query(
    collection(db, "bookings"),
    where("venueId", "==", venueId),
    where("date", "==", date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().startTime as string);
};

// 🌍 Fetch Open Matches
export const getOpenMatches = async () => {
  const q = query(
    collection(db, "bookings"),
    where("type", "==", "open"),
    where("status", "==", "open"),
    orderBy("date", "asc"),
    limit(20)
  );
  
  const snapshot = await getDocs(q);
  const now = new Date().toISOString().split('T')[0];
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Booking))
    .filter(b => b.date >= now);
};

// 📋 Fetch User History
export const getUserBookings = async (userId: string) => {
  const q = query(
    collection(db, "bookings"),
    where("players", "array-contains", userId),
    orderBy("date", "desc") 
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
};