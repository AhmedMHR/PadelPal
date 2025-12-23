import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

// It's good practice to define the shape of your objects.
interface AuthUser {
  uid: string;
  email: string | null; // email from firebase auth can be null
}

export interface Message {
  id?: string;
  text: string;
  senderId: string;
  senderName: string; // We'll use email for now
  createdAt: Timestamp; // Changed from 'any'
}

// 📨 Send a Message
export const sendMessage = async (bookingId: string, text: string, user: AuthUser) => { // Changed from 'any'
  if (!text.trim() || !user.email) return; // Add check for email
  
  await addDoc(collection(db, "bookings", bookingId, "messages"), {
    text: text,
    senderId: user.uid,
    senderName: user.email.split('@')[0], // Extract name from email
    createdAt: Timestamp.now()
  });
};

// 👂 Listen to Messages (Real-time!)
export const subscribeToMessages = (bookingId: string, callback: (msgs: Message[]) => void) => {
  const q = query(
    collection(db, "bookings", bookingId, "messages"),
    orderBy("createdAt", "asc")
  );

  // onSnapshot sets up a live listener
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
    callback(messages);
  });
};