import "server-only";
import admin from "firebase-admin";

// Helper to fix the private key newline issue
const formatPrivateKey = (key: string | undefined) => {
  if (!key) return undefined;
  return key.replace(/\\n/g, "\n");
};

if (!admin.apps.length) {
  // 🟢 We use the environment variables stored in Firebase App Hosting
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("✅ Admin SDK Initialized Successfully");
  } else {
    console.error("❌ Failed to initialize Admin SDK: Missing Keys");
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();