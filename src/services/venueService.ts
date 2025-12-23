
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

export interface Venue {
  id?: string;
  name: string;
  location: string;
  pricePerHour: number;
  image: string;
  amenities: string[];
  courts: number;
}

// 1. Fetch all venues
export const getVenues = async (): Promise<Venue[]> => {
  const querySnapshot = await getDocs(collection(db, "venues"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venue));
};

// 2. 🏭 Create a Real Venue (For Admin Panel)
export const createVenue = async (data: Omit<Venue, 'id'>) => {
  await addDoc(collection(db, "venues"), {
    ...data,
    amenities: data.amenities || ["WiFi", "Parking", "Showers"], 
    courts: 4 
  });
};