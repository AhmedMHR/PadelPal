'use client';
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking } from "@/services/bookingService";
import { 
  joinMatchAction, 
  submitMatchScoreAction, 
  correctMatchResultAction, 
  leaveMatchAction, 
  cancelMatchAction 
} from "@/app/actions";
import { subscribeToMessages, sendMessage, Message } from "@/services/chatService"; 
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Share2, User as UserIcon, Send, MessageCircle, Trophy, Pencil } from "lucide-react";

export default function MatchDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [match, setMatch] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(false);

  // Score State
  const [scoreInput, setScoreInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchMatch = async () => {
      try {
        const docRef = doc(db, "bookings", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Booking;
          setMatch({ id: docSnap.id, ...data });
          if(data.score) setScoreInput(data.score);
        } else {
            console.log("No such match!");
        }
      } catch (err) {
        console.error("Error fetching match:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();

    const unsubscribe = subscribeToMessages(id as string, (msgs) => {
        setMessages(msgs);
    });
    return () => unsubscribe();
  }, [id]);

  const handleJoin = async () => {
    if (!user || !match) return;
    try {
      const result = await joinMatchAction(match.id!, user.uid);
      if (!result.success) {
        alert(result.message);
      } else {
        setMatch(prev => prev ? {...prev, players: [...prev.players, user.uid]} : null);
      }
    } catch (e) { console.error(e); }
  };

  const handleFinishMatch = async () => {
    if (!match || !scoreInput.trim()) return;
    setIsSubmitting(true);
    try {
        const winners = [match.hostId];
        const result = await submitMatchScoreAction(match.id!, scoreInput, winners);
        if(result.success) {
          alert("Match Finished! Level Updated! 🚀");
          router.push("/profile");
        } else {
          alert(result.message)
        }
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
        const currentWinners = match.winners || [match.hostId]; 
        const result = await correctMatchResultAction(match.id!, scoreInput, currentWinners);
        if(result.success) {
          setMatch(prev => prev ? { ...prev, score: scoreInput } : null);
          setIsEditing(false);
          alert("Score & Stats recalculated successfully! ⚖️");
        } else {
          alert(result.message)
        }
    } catch (e) {
        console.error(e);
        alert("Failed to update score");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !match) return;
    if (confirm("Are you sure you want to leave?")) {
      try {
        const result = await leaveMatchAction(match.id!, user.uid);
        if (result.success) {
           router.push("/dashboard");
        } else {
           alert(result.message);
        }
      } catch (e) { console.error(e); }
    }
  };

  const handleCancel = async () => {
    if (!match) return;
    if (confirm("Delete this match? This cannot be undone.")) {
      try {
        const result = await cancelMatchAction(match.id!);
        if (result.success) {
           router.push("/dashboard");
        } else {
           alert(result.message);
        }
      } catch (e) { console.error(e); }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    await sendMessage(id as string, newMessage, user);
    setNewMessage("");
  };

  const handleShare = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard! 🔗");
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading match...</div>;
  if (!match) return <div className="text-white text-center mt-20">Match not found</div>;

  const isPlayer = user && match.players.includes(user.uid);
  const isHost = user && match.hostId === user.uid;
  const isFull = match.players.length >= 4;
  const isFinished = match.status === 'finished';

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
            <Link href="/dashboard" className="text-gray-400 hover:text-white">
                <ArrowLeft />
            </Link>
            <h1 className="text-xl font-bold">Match Details</h1>
            <button onClick={handleShare} className="text-lime-400 hover:text-lime-300">
                <Share2 />
            </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 mb-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-2">{match.courtName}</h2>
            <div className="flex items-center gap-2 text-gray-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>{match.date}</span>
                <span className="mx-2">•</span>
                <Clock className="w-4 h-4" />
                <span>{match.startTime}</span>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-gray-400">Type</span>
                    <span className="capitalize font-medium">{match.type}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-gray-400">Level</span>
                    <span className="font-medium">{match.level}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg">
                    <span className="text-gray-400">Price</span>
                    <span className="font-medium text-lime-400">{match.pricePerPlayer} EGP</span>
                </div>
                {isFinished && (
                     <div className="flex justify-between items-center bg-lime-400/10 border border-lime-400/30 p-3 rounded-lg">
                        <span className="text-lime-400 flex items-center gap-2"><Trophy className="w-4 h-4"/> Score</span>
                        <span className="font-bold text-lime-400 text-lg">{match.score}</span>
                     </div>
                )}
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-lime-400" />
                Players ({match.players.length}/4)
            </h3>
            <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded-xl flex items-center justify-center border-2 ${i < match.players.length ? 'bg-slate-700 border-lime-400' : 'bg-slate-800 border-slate-700 border-dashed'}`}>
                        {i < match.players.length ? (
                            <UserIcon className="w-8 h-8 text-white" />
                        ) : (
                            <span className="text-slate-600 font-bold">{i + 1}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {!isFinished && (
            <div className="space-y-3">
                {!isPlayer && !isFull && (
                    <button onClick={handleJoin} className="w-full bg-lime-400 text-slate-900 py-4 rounded-xl font-bold text-lg hover:bg-lime-300 transition">
                        Join Match
                    </button>
                )}
                
                {isPlayer && isHost && (
                     <div className="space-y-3">
                        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <h3 className="font-bold mb-2">Host Controls</h3>
                            <input 
                                type="text" 
                                placeholder="Final Score (e.g. 6-4, 6-2)" 
                                className="w-full bg-slate-900 p-3 rounded-lg mb-3"
                                value={scoreInput}
                                onChange={e => setScoreInput(e.target.value)}
                            />
                            <button onClick={handleFinishMatch} disabled={isSubmitting} className="w-full bg-lime-400 text-slate-900 py-3 rounded-lg font-bold">
                                {isSubmitting ? "Saving..." : "Finish Match & Save Score"}
                            </button>
                        </div>
                        <button onClick={handleCancel} className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl border border-red-500/50">
                            Cancel Match
                        </button>
                     </div>
                )}

                {isPlayer && !isHost && (
                    <button onClick={handleLeave} className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl border border-red-500/50">
                        Leave Match
                    </button>
                )}
            </div>
        )}

        {isFinished && isHost && (
            <div className="mt-6">
                 {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2">
                        <Pencil className="w-4 h-4" /> Edit Score
                    </button>
                 ) : (
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
                        <h3 className="font-bold mb-2 text-yellow-400">Correction Mode</h3>
                        <p className="text-xs text-gray-400 mb-3">Updating the score will automatically revert old stats and apply new ones.</p>
                        <input 
                            type="text" 
                            className="w-full bg-slate-900 p-3 rounded-lg mb-3 border border-yellow-400/30"
                            value={scoreInput}
                            onChange={e => setScoreInput(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-700 py-2 rounded-lg">Cancel</button>
                            <button onClick={handleEditScore} disabled={isSubmitting} className="flex-1 bg-yellow-400 text-black py-2 rounded-lg font-bold">
                                {isSubmitting ? "Updating..." : "Update Score"}
                            </button>
                        </div>
                    </div>
                 )}
            </div>
        )}

        <button 
            onClick={() => setShowChat(!showChat)}
            className="fixed bottom-6 right-6 bg-lime-400 text-slate-900 p-4 rounded-full shadow-lg shadow-lime-400/20 z-50"
        >
            <MessageCircle className="w-6 h-6" />
        </button>

        {showChat && (
            <div className="fixed inset-x-0 bottom-0 h-[60vh] bg-slate-800 rounded-t-3xl shadow-2xl border-t border-slate-700 z-50 flex flex-col animate-in slide-in-from-bottom">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold">Match Chat</h3>
                    <button onClick={() => setShowChat(false)} className="text-gray-400">✕</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        const msgDate = msg.createdAt ? (msg.createdAt as Timestamp).toDate() : new Date();

                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-lime-400 text-slate-900 rounded-br-none' : 'bg-slate-700 text-white rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1">
                                   {msgDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        )
                    })}
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 bg-slate-800">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 focus:border-lime-400 focus:outline-none"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="bg-lime-400 text-slate-900 p-3 rounded-full font-bold">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        )}
      </div>
    </div>
  );
}