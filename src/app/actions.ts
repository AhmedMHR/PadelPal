"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function topUpWallet(userId: string, amount: number) {
  if (!userId) return { success: false, message: "User ID required" };

  try {
    const userRef = adminDb.collection("users").doc(userId);

    // 🟢 Run a Transaction (Prevents money errors)
    await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("User does not exist!");
      }

      const currentBalance = userDoc.data()?.balance || 0;
      const newBalance = currentBalance + amount;

      // Update the balance
      transaction.update(userRef, { balance: newBalance });
    });

    // Refresh the page data instantly
    revalidatePath("/dashboard");
    revalidatePath("/profile");
    
    return { success: true, message: `Added ${amount} EGP` };

  } catch (error) {
    console.error("Top Up Failed:", error);
    return { success: false, message: "Transaction failed" };
  }
}