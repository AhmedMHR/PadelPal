import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 📤 Upload Image to Firebase Storage
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  // 1. Create a reference (path) in the storage bucket
  // e.g., "profile_images/user123/myphoto.jpg"
  // Use a fixed name like 'avatar' to overwrite old photos automatically so we don't waste space.
  const storageRef = ref(storage, `profile_images/${userId}/avatar`);

  // 2. Upload the raw bytes
  const snapshot = await uploadBytes(storageRef, file);
  console.log('Uploaded a blob or file!', snapshot);

  // 3. Get the public download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};