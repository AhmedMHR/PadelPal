"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { DocumentReference } from "firebase-admin/firestore";

interface BookingData {
  venueId: string;
  hostId: string;
  courtName: string;
  date: string;
  startTime: string;
  type: 'private' | 'open';
  level: number;
  pricePerPlayer: number;
}

export async function topUpWallet(userId: string, amount: number) {
  if (!userId) return { success: false, message: "User ID required" };

  try {
    const userRef = adminDb.collection("users").doc(userId);

    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) throw new Error("User does not exist!");

      const currentBalance = userDoc.data()?.balance || 0;
      transaction.update(userRef, { balance: currentBalance + amount });
    });

    revalidatePath("/dashboard");
    revalidatePath("/profile");
    return { success: true, message: `Added ${amount} EGP` };

  } catch (error) {
    console.error("Top Up Failed:", error);
    return { success: false, message: "Transaction failed" };
  }
}

export async function createBookingAction(bookingData: BookingData) {
  try {
    const docRef = await adminDb.collection("bookings").add({
      ...bookingData,
      players: [bookingData.hostId],
      status: 'open',
      createdAt: new Date(),
    });

    revalidatePath("/dashboard");
    revalidatePath(`/match/${docRef.id}`);
    revalidatePath(`/book/${bookingData.venueId}`);
    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error("Booking Failed:", error);
    return { success: false, message: "Booking creation failed" };
  }
}

export async function joinMatchAction(bookingId: string, userId: string) {
  try {
    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const snap = await bookingRef.get();

    if (!snap.exists) return { success: false, message: "Match not found" };

    const data = snap.data()!;
    const players = (data.players || []) as string[];

    if (players.length >= 4) return { success: false, message: "Match is full" };
    if (players.includes(userId)) return { success: false, message: "Already joined" };

    await bookingRef.update({
      players: [...players, userId],
      status: (players.length + 1) === 4 ? 'full' : 'open'
    });

    revalidatePath(`/match/${bookingId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Joined match successfully" };
  } catch (error) {
    console.error("Join Match Failed:", error);
    return { success: false, message: "Failed to join match" };
  }
}

export async function submitMatchScoreAction(matchId: string, score: string, winnerIds: string[]) {
  try {
    const matchRef = adminDb.collection("bookings").doc(matchId);
    
    await adminDb.runTransaction(async (transaction) => {
      const matchDoc = await transaction.get(matchRef);
      if (!matchDoc.exists) throw new Error("Match not found!");

      const matchData = matchDoc.data()!;
      const playerIds = (matchData.players || []) as string[];

      for (const playerId of playerIds) {
        const userRef = adminDb.collection("users").doc(playerId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists) {
          const userData = userDoc.data()!;
          const isWinner = winnerIds.includes(playerId);
          const levelChange = isWinner ? 0.1 : -0.05;
          const currentLevel = userData.level || 1.5;
          const newLevel = Math.max(1, currentLevel + levelChange);
          const winsChange = isWinner ? 1 : 0;

          transaction.update(userRef, {
            level: parseFloat(newLevel.toFixed(2)),
            wins: (userData.wins || 0) + winsChange,
          });
        }
      }

      transaction.update(matchRef, {
        status: 'finished',
        score: score,
        winners: winnerIds,
      });
    });

    revalidatePath(`/match/${matchId}`);
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true, message: "Match score submitted!" };
  } catch (error) {
    console.error("Submit Score Failed:", error);
    return { success: false, message: "Failed to submit score" };
  }
}

export async function correctMatchResultAction(matchId: string, newScore: string, newWinnerIds: string[]) {
  try {
    await adminDb.runTransaction(async (transaction) => {
      const matchRef = adminDb.collection("bookings").doc(matchId);
      const matchSnap = await transaction.get(matchRef);
      if (!matchSnap.exists) throw new Error("Match not found");

      const matchData = matchSnap.data()!;
      const oldWinnerIds = (matchData.winners || []) as string[];
      const allPlayerIds = (matchData.players || []) as string[];
      
      const userRefs = allPlayerIds.map((uid) => adminDb.collection("users").doc(uid));
      
      const userSnaps = await Promise.all(
        userRefs.map((ref: DocumentReference) => transaction.get(ref))
      );

      userSnaps.forEach((userSnap, index) => {
        const uid = allPlayerIds[index];
        const userRef = userRefs[index];
        const userData = userSnap.data();
        if (!userData) return;

        let levelChange = 0;
        let winsChange = 0;

        if (oldWinnerIds.includes(uid)) {
          winsChange -= 1;
          levelChange -= 0.1;
        } else {
           levelChange += 0.05; 
        }

        if (newWinnerIds.includes(uid)) {
          winsChange += 1;
          levelChange += 0.1;
        } else {
          levelChange -= 0.05;
        }

        const newLevel = Math.max(1, (userData.level || 1.0) + levelChange);

        transaction.update(userRef, {
          wins: (userData.wins || 0) + winsChange,
          level: parseFloat(newLevel.toFixed(2)),
        });
      });

      transaction.update(matchRef, {
        score: newScore,
        winners: newWinnerIds,
      });
    });

    revalidatePath(`/match/${matchId}`);
    revalidatePath("/profile");
    return { success: true, message: "Score & Stats recalculated successfully!" };

  } catch (error) {
    console.error("Correct Match Failed:", error);
    return { success: false, message: "Failed to correct match result" };
  }
}

export async function leaveMatchAction(matchId: string, userId: string) {
  try {
    const matchRef = adminDb.collection("bookings").doc(matchId);
    const matchSnap = await matchRef.get();

    if (!matchSnap.exists) return { success: false, message: "Match not found" };

    const matchData = matchSnap.data()!;
    const currentPlayers = (matchData.players || []) as string[];
    
    const updatedPlayers = currentPlayers.filter((id) => id !== userId);

    await matchRef.update({
      players: updatedPlayers,
      status: 'open' 
    });

    revalidatePath(`/match/${matchId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Left match successfully" };
  } catch (error) {
    console.error("Leave Match Failed:", error);
    return { success: false, message: "Failed to leave match" };
  }
}

export async function cancelMatchAction(matchId: string) {
  try {
    await adminDb.collection("bookings").doc(matchId).delete();
    revalidatePath("/dashboard");
    return { success: true, message: "Match cancelled successfully" };
  } catch (error) {
    console.error("Cancel Match Failed:", error);
    return { success: false, message: "Failed to cancel match" };
  }
}

export async function createChallengeMatchAction(challengerId: string, opponentId: string) {
  try {
    const docRef = await adminDb.collection("bookings").add({
      hostId: challengerId,
      players: [challengerId, opponentId],
      status: 'private', // Or another status to indicate a challenge
      type: 'private',
      createdAt: new Date(),
      // Add other necessary fields for a match, even if they are placeholders
      venueId: 'challenge',
      courtName: 'Challenge Match',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      level: 0, // You can decide on a default level or calculate an average
      pricePerPlayer: 0,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/match/${docRef.id}`);
    return { success: true, matchId: docRef.id };
  } catch (error) {
    console.error("Challenge Match Creation Failed:", error);
    return { success: false, message: "Failed to create challenge match" };
  }
}
