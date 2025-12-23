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

// 💾 Create the booking (Private or Open)
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status' | 'players'>) => {
  const docRef = await addDoc(collection(db, "bookings"), {
    ...bookingData,
    players: [bookingData.hostId], 
    status: 'open',
    createdAt: Timestamp.now(),
  });
  return docRef; 
};

// ⚔️ Create a Challenge Match
export const createChallengeMatch = async (hostId: string, opponentId: string) => {
  const docRef = await addDoc(collection(db, "bookings"), {
      venueId: "challenge", // Special type for challenges
      courtName: "Challenge Match",
      date: new Date().toISOString().split('T')[0], // Today
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Now
      type: 'private',
      hostId: hostId,
      players: [hostId, opponentId],
      level: 0, // Not applicable
      pricePerPlayer: 0, // No cost
      status: 'full', // Match is full from the start
      createdAt: Timestamp.now(),
  });
  return docRef.id;
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

// 🤝 Join an Open Match
export const joinMatch = async (bookingId: string, userId: string) => {
  const bookingRef = doc(db, "bookings", bookingId);
  const snap = await getDoc(bookingRef);
  
  if (!snap.exists()) throw new Error("Match not found");
  const data = snap.data() as Booking;

  if (data.players.length >= 4) throw new Error("Match is full");
  if (data.players.includes(userId)) throw new Error("Already joined");

  await updateDoc(bookingRef, {
    players: arrayUnion(userId),
    status: (data.players.length + 1) === 4 ? 'full' : 'open'
  });
};

// 🏆 Submit Match Score (Simple)
export const submitMatchScore = async (matchId: string, score: string, winnerIds: string[]) => {
    const matchRef = doc(db, "bookings", matchId);
    
    await updateDoc(matchRef, {
        status: 'finished',
        score: score,
        winners: winnerIds
    });
};

// ✏️ Update Match Score Text (Quick Fix)
export const updateMatchScore = async (matchId: string, newScore: string) => {
    const matchRef = doc(db, "bookings", matchId);
    await updateDoc(matchRef, {
        score: newScore
    });
};

// ⚖️ The "Refund & Re-apply" Logic (Complex but Safe)
export const correctMatchResult = async (
  matchId: string, 
  newScore: string, 
  newWinnerIds: string[]
) => {
  await runTransaction(db, async (transaction) => {
    // 1. Read the Match Doc
    const matchRef = doc(db, "bookings", matchId);
    const matchSnap = await transaction.get(matchRef);
    if (!matchSnap.exists()) throw new Error("Match not found");
    
    const matchData = matchSnap.data() as Booking;
    const oldWinnerIds = matchData.winners || []; 
    const allPlayerIds = matchData.players;

    // 2. Read ALL User Docs involved
    const userRefs = allPlayerIds.map(uid => doc(db, "users", uid));
    const userSnaps = await Promise.all(userRefs.map(ref => transaction.get(ref)));

    // 3. Process Each User
    userSnaps.forEach((userSnap, index) => {
      const uid = allPlayerIds[index];
      const userRef = userRefs[index];
      const userData = userSnap.data();
      
      if (!userData) return; 

      // --- A. REVERSE OLD RESULT ---
      let levelChange = 0;
      let winsChange = 0;

      const wasOldWinner = oldWinnerIds.includes(uid);
      if (wasOldWinner) {
        winsChange -= 1;   
        levelChange -= 0.1; 
      } else {
        levelChange += 0.05; 
      }

      // --- B. APPLY NEW RESULT ---
      const isNewWinner = newWinnerIds.includes(uid);
      if (isNewWinner) {
        winsChange += 1;
        levelChange += 0.1;
      } else {
        levelChange -= 0.05;
      }

      // --- C. QUEUE THE UPDATE ---
      transaction.update(userRef, {
        wins: (userData.wins || 0) + winsChange,
        level: Number(((userData.level || 1.0) + levelChange).toFixed(2)) 
      });
    });

    // 4. Update the Match Doc
    transaction.update(matchRef, {
      score: newScore,
      winners: newWinnerIds
    });
  });
};

// 🚪 Leave a Match (Guest)
export const leaveMatch = async (matchId: string, userId: string) => {
  const matchRef = doc(db, "bookings", matchId);
  await updateDoc(matchRef, {
    players: arrayRemove(userId)
  });
};

// ❌ Cancel a Match (Host)
export const cancelMatch = async (matchId: string) => {
  const matchRef = doc(db, "bookings", matchId);
  await deleteDoc(matchRef);
};