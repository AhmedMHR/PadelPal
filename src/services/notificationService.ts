import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, onSnapshot, doc, deleteDoc, Timestamp } from "firebase/firestore";
import { createChallengeMatch } from "./bookingService";

export interface Notification {
  id?: string;
  type: 'challenge';
  fromUserId: string;
  fromName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: any;
}

// 📨 Send an Invite
export const sendChallengeInvite = async (fromUser: any, toUserId: string) => {
  await addDoc(collection(db, "notifications"), {
    type: 'challenge',
    fromUserId: fromUser.uid,
    fromName: fromUser.email.split('@')[0], // Simple name
    toUserId: toUserId,
    status: 'pending',
    createdAt: Timestamp.now()
  });
};

// 👂 Listen for Notifications (Real-time)
export const subscribeToNotifications = (userId: string, callback: (notifs: Notification[]) => void) => {
  const q = query(
    collection(db, "notifications"),
    where("toUserId", "==", userId),
    where("status", "==", "pending") // Only show active invites
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    callback(data);
  });
};

// ✅ Handle Response (Accept/Decline)
export const respondToInvite = async (notification: Notification, accept: boolean) => {
  if (accept) {
    // 1. Create the Match
    const matchId = await createChallengeMatch(notification.fromUserId, notification.toUserId);
    
    // 2. Delete the notification (cleanup)
    await deleteDoc(doc(db, "notifications", notification.id!));
    
    return matchId; // Return ID so we can redirect
  } else {
    // Just delete the notification
    await deleteDoc(doc(db, "notifications", notification.id!));
    return null;
  }
};