'use client';
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { useAuth } from "@/context/AuthContext";
import { generateTimeSlots, getBookedSlots, createBooking } from "@/services/bookingService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Users, Lock, Globe } from "lucide-react";

export default function BookVenue() {
  const { venueId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [venueName, setVenueName] = useState("Loading...");
  const [venuePrice, setVenuePrice] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🎾 Match Settings
  const [matchType, setMatchType] = useState<'private' | 'open'>('private');
  const [matchLevel, setMatchLevel] = useState(1.5); // Default beginner level

  // 1. Init Date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // 2. Fetch Venue Data
  useEffect(() => {
    const fetchVenue = async () => {
      if (typeof venueId === 'string') {
        const docRef = doc(db, "venues", venueId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setVenueName(docSnap.data().name);
            setVenuePrice(docSnap.data().pricePerHour || 300);
        }
      }
    };
    fetchVenue();
  }, [venueId]);

  // 3. Fetch Slots
  useEffect(() => {
    if (!venueId || !selectedDate) return;
    const loadSlots = async () => {
        const allSlots = generateTimeSlots();
        setSlots(allSlots);
        const taken = await getBookedSlots(venueId as string, selectedDate);
        setBookedSlots(taken);
    };
    loadSlots();
  }, [venueId, selectedDate]);

  const handleBooking = async () => {
    if (!user || !selectedSlot) return;
    setLoading(true);

    try {
      const docRef = await createBooking({ 
        venueId: venueId as string,
        hostId: user.uid,
        courtName: "Court 1",
        date: selectedDate,
        startTime: selectedSlot,
        type: matchType,
        level: matchLevel,
        pricePerPlayer: venuePrice / 4 
      });

      // Redirect Logic
      if (matchType === 'open') {
         router.push(`/match/${docRef.id}`);
      } else {
        alert("Court Booked! 🎾");
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-padel-dark text-white p-6 flex flex-col items-center">
      <div className="max-w-md w-full">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm mb-4 block">← Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-1 text-padel-lime">{venueName}</h1>
        <p className="text-gray-400 mb-6 text-sm">Create a match or book a court.</p>

        {/* --- 🎾 NEW: Match Type Toggle --- */}
        <div className="bg-padel-surface p-1 rounded-xl flex mb-8 border border-gray-800">
            <button 
                onClick={() => setMatchType('private')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${matchType === 'private' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <Lock className="w-4 h-4" /> Private Booking
            </button>
            <button 
                onClick={() => setMatchType('open')}
                className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${matchType === 'open' ? 'bg-padel-lime text-padel-dark shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
                <Globe className="w-4 h-4" /> Open Match
            </button>
        </div>

        {/* Conditional: Level Slider for Open Matches */}
        {matchType === 'open' && (
            <div className="mb-8 animate-fade-in bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-padel-lime flex items-center gap-2">
                        <Users className="w-4 h-4" /> Required Level
                    </label>
                    <span className="text-white font-bold">{matchLevel}</span>
                </div>
                <input 
                    type="range" 
                    min="1" max="7" step="0.5"
                    value={matchLevel}
                    onChange={(e) => setMatchLevel(parseFloat(e.target.value))}
                    className="w-full accent-padel-lime cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2">
                    Players near level {matchLevel} can see and join this match.
                </p>
            </div>
        )}
        {/* ------------------------------- */}

        <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Select Date</label>
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-padel-surface border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-padel-lime outline-none"
            />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
            {slots.map((slot) => {
                const isTaken = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                    <button
                        key={slot}
                        disabled={isTaken}
                        onClick={() => setSelectedSlot(slot)}
                        className={`
                            py-3 rounded-lg text-sm font-bold transition
                            ${isTaken 
                                ? "bg-gray-800 text-gray-600 cursor-not-allowed line-through" 
                                : isSelected 
                                    ? "bg-padel-lime text-padel-dark ring-2 ring-white scale-105" 
                                    : "bg-padel-surface hover:bg-gray-700 text-white border border-gray-700"}
                        `}
                    >
                        {slot}
                    </button>
                )
            })}
        </div>

        <button 
            onClick={handleBooking}
            disabled={!selectedSlot || loading}
            className="w-full bg-white text-padel-dark font-bold py-4 rounded-xl hover:bg-padel-lime transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? "Processing..." : selectedSlot ? 
                (matchType === 'open' ? `Create Open Match at ${selectedSlot}` : `Book Court at ${selectedSlot}`) 
                : "Select a Time"}
        </button>
      </div>
    </div>
  );
}
