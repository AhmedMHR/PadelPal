'use client';
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUserProfile } from "@/services/userService";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create Firestore Profile
      await createUserProfile(userCredential.user);
      router.push("/");
    } catch (error) {
      console.error(error);
      setError("Failed to create account. Email might be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join PadelPal" subtitle="Create your account to start booking.">
      <form onSubmit={handleSignup} className="space-y-4">
        {error && <div className="p-3 bg-red-500/10 text-red-400 text-sm rounded-lg">{error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input 
            type="email" 
            required
            className="w-full bg-padel-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-padel-lime outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-padel-dark border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-padel-lime outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-padel-lime text-padel-dark font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p className="text-center text-gray-400 mt-6 text-sm">
        Already have an account? <Link href="/login" className="text-padel-lime hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
