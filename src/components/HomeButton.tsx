"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home } from "lucide-react";

export default function HomeButton() {
  const pathname = usePathname();

  // 🛑 Don't show the button on these pages
  const hiddenPages = ["/dashboard", "/login", "/signup", "/"];
  
  if (hiddenPages.includes(pathname)) {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-6 right-6 z-50 bg-padel-lime text-padel-dark p-4 rounded-full shadow-[0_0_20px_rgba(210,230,3,0.4)] hover:scale-110 hover:rotate-12 transition duration-300"
      title="Back to Home"
    >
      <Home className="w-6 h-6" />
    </Link>
  );
}