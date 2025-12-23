'use client';
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch {
      setError("Invalid credentials. Try again?");
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Ready to smash it?">
      <form onSubmit={handleLogin} className="space-y-4">
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

        <button type="submit" className="w-full bg-padel-lime text-padel-dark font-bold py-3 rounded-xl hover:opacity-90 transition">
          Sign In
        </button>
      </form>
      <p className="text-center text-gray-400 mt-6 text-sm">
        Don&apos;t have an account? <Link href="/signup" className="text-padel-lime hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
