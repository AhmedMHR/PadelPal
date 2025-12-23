
"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking, submitMatchScore, correctMatchResult, leaveMatch, cancelMatch } from "@/services/bookingService"; // Updated import
import { subscribeToMessages, sendMessage, Message } from "@/services/chatService"; 
import { updateUserStats } from "@/services/userService";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, User as UserIcon, Send, MessageCircle, Trophy, Pencil } from "lucide-react";

export default function MatchLobby() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Score State
  const [scoreInput, setScoreInput] = useState("6-4, 6-4");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // State for editing score

  // Fetch Match
  useEffect(() => {
    if (!id) return;
    const fetchMatch = async () => {
      const docRef = doc(db, "bookings", id as string);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const matchData = { id: snap.id, ...snap.data() } as Booking;
        setMatch(matchData);
        setScoreInput(matchData.score || "6-4, 6-4");
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    };
    fetchMatch();
  }, [id, router]);

  // Subscribe Chat
  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToMessages(id as string, (msgs) => {
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [id]);

  const handleJoin = async () => {
    if (!user || !match) return;
    try {
      await updateDoc(doc(db, "bookings", match.id!), { players: arrayUnion(user.uid) });
      setMatch(prev => prev ? {...prev, players: [...prev.players, user.uid]} : null);
    } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!user || !id || !newMessage.trim()) return;
    await sendMessage(id as string, newMessage, user);
    setNewMessage("");
  };

  const handleFinishMatch = async () => {
    if (!user || !match) return;
    setIsSubmitting(true);
    try {
        const winners = [match.hostId]; 
        await submitMatchScore(match.id!, scoreInput, winners);
        
        // This is simplified. The transaction should handle stat updates.
        // For now, we just give the host a win.
        await updateUserStats(match.hostId, true); 
        const loserIds = match.players.filter(p => p !== match.hostId);
        await Promise.all(loserIds.map(id => updateUserStats(id, false)));


        alert("Match Finished! Level Updated! 🚀");
        router.push("/profile");
    } catch (e) {
        console.error(e);
        alert("Error saving score");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleEditScore = async () => {
    if (!match || !scoreInput.trim()) return;
    setIsSubmitting(true);
    try {
        // Logic: For simplicity, assume winners don't change when editing score text.
        // The `correctMatchResult` function is ready to handle winner changes if needed.
        const currentWinners = match.winners || [match.hostId]; 
        
        await correctMatchResult(match.id!, scoreInput, currentWinners);
        
        setMatch(prev => prev ? { ...prev, score: scoreInput } : null);
        setIsEditing(false);
        alert("Score & Stats recalculated successfully! ⚖️");
    } catch (e) {
        console.error(e);
        alert("Failed to update score");
    } finally {
        setIsSubmitting(false);
    }
  };

  // 🚪 Handle Leaving
  const handleLeave = async () => {
    if (!user || !match) return;
    const isHost = match.hostId === user.uid;

    if (confirm(isHost ? "Delete this match completely?" : "Leave this match?")) {
      try {
        if (isHost) {
          await cancelMatch(match.id!);
        } else {
          await leaveMatch(match.id!, user.uid);
        }
        router.push("/dashboard"); // Send them home
      } catch (e) {
        console.error(e);
        alert("Could not leave match.");
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-padel-dark text-white flex items-center justify-center">Loading...</div>;
  if (!match) return null;

  const filledSlots = match.players.length;
  const isPlayer = match.players.includes(user?.uid || "");
  const isFinished = match.status === 'finished';

  return (
    <div className="min-h-screen bg-padel-dark text-white p-6 pb-24">
      
      {/* Header */}
      <div className="max-w-md mx-auto mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="text-gray-400 hover:text-white"><ArrowLeft className="w-6 h-6" /></Link>
        <span className="font-bold text-lg">Match Lobby</span>
        <button className="text-padel-lime"><Share2 className="w-6 h-6" /></button>
      </div>

      <div className="max-w-md mx-auto">
        
        {/* Match Info Card */}
        <div className="bg-padel-surface rounded-3xl overflow-hidden border border-gray-800 mb-6">
            <div className="bg-gray-800 p-6 text-center">
                <h1 className="text-2xl font-bold mb-1">{match.courtName}</h1>
                
                {isFinished ? (
                  isEditing ? (
                    <div className="flex gap-2 mt-4">
                        <input
                            type="text"
                            value={scoreInput}
                            onChange={(e) => setScoreInput(e.target.value)}
                            className="flex-1 bg-black rounded-lg px-3 py-2 text-sm text-white border border-gray-600"
                            placeholder="e.g. 6-2, 6-4"
                        />
                        <button
                            onClick={handleEditScore}
                            disabled={isSubmitting}
                            className="bg-padel-lime hover:opacity-90 text-padel-dark px-4 py-2 rounded-lg text-xs font-bold transition"
                        >
                            {isSubmitting ? "Saving..." : "Save"}
                        </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="bg-padel-lime text-padel-dark py-2 px-4 rounded-xl inline-block font-bold transform -rotate-2">
                           FINAL SCORE: {match.score}
                        </div>
                        {isPlayer && (
                             <button onClick={() => setIsEditing(true)} className="bg-gray-700 p-2 rounded-full hover:bg-padel-lime hover:text-padel-dark transition">
                                <Pencil className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                  )
                ) : (
                    <div className="flex justify-center gap-4 text-sm text-gray-400 mt-2">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> {match.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {match.startTime}</span>
                    </div>
                )}
            </div>
            
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Team ({filledSlots}/4)</h3>
                    <span className="text-xs bg-padel-lime text-padel-dark px-2 py-1 rounded font-bold">Level {match.level.toFixed(1)}</span>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                    {match.players.map((playerId) => (
                        <div key={playerId} className="flex flex-col items-center gap-2">
                             <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border-2 border-padel-lime">
                                <UserIcon className="w-5 h-5 text-white" />
                             </div>
                        </div>
                    ))}
                    {[...Array(4 - filledSlots)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 opacity-30">
                             <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600"><span className="text-lg font-bold text-gray-500">+</span></div>
                        </div>
                    ))}
                </div>
                
                {!isPlayer && !isFinished && (
                    <button onClick={handleJoin} className="w-full bg-padel-lime text-padel-dark font-bold py-3 rounded-xl hover:opacity-90">
                        Join for {match.pricePerPlayer} EGP
                    </button>
                )}

                {isPlayer && !isFinished && (
                    <div className="mt-6 bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-4 h-4 text-padel-lime" />
                            <span className="text-sm font-bold text-gray-300">Record Result</span>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={scoreInput}
                                onChange={(e) => setScoreInput(e.target.value)}
                                className="flex-1 bg-black rounded-lg px-3 py-2 text-sm text-white border border-gray-600"
                                placeholder="e.g. 6-2, 6-4"
                            />
                            <button 
                                onClick={handleFinishMatch}
                                disabled={isSubmitting}
                                className="bg-gray-700 hover:bg-white hover:text-black text-white px-4 py-2 rounded-lg text-xs font-bold transition"
                            >
                                {isSubmitting ? "..." : "Finish"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Chat Section */}
        <div className="bg-padel-surface rounded-3xl border border-gray-800 flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-padel-lime" />
                <h3 className="font-bold">Match Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30">
                {messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-padel-lime text-padel-dark rounded-br-none' : 'bg-gray-700 text-white rounded-bl-none'}`}>
                                {msg.text}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.senderName}</span>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-gray-800 flex gap-2 bg-padel-surface">
                <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-padel-lime"
                />
                <button onClick={handleSend} className="bg-padel-lime text-padel-dark p-3 rounded-xl"><Send className="w-5 h-5" /></button>
            </div>
        </div>

        {/* 🚪 Leave / Cancel Button */}
        {isPlayer && !isFinished && (
            <div className="mt-8 text-center">
                <button 
                    onClick={handleLeave}
                    className="text-red-500 text-sm font-bold hover:text-red-400 hover:underline transition"
                >
                    {match.hostId === user?.uid ? "❌ Cancel Match" : "🏃 Leave Match"}
                </button>
            </div>
        )}

      </div>
    </div>
  );
}
