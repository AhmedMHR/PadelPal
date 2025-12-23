"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getVenues, Venue } from "@/services/venueService";
import { getOpenMatches, Booking, joinMatch } from "@/services/bookingService";
import { getLeaderboard, UserProfile, getUserProfile } from "@/services/userService";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import { LogOut, Calendar, Trophy, Search, BookOpen, MapPin, Clock, Home, PlusCircle, Bell, Check, X, Wallet, Play } from "lucide-react";
import { subscribeToNotifications, sendChallengeInvite, respondToInvite, Notification } from "@/services/notificationService";
import { VIDEO_LIBRARY, Video } from "@/data/videos";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Data State
  const [venues, setVenues] = useState<Venue[]>([]);
  const [openMatches, setOpenMatches] = useState<Booking[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]); 
  const [balance, setBalance] = useState(0);

  // UI State
  const [activeTab, setActiveTab] = useState<'book' | 'match' | 'compete' | 'learn'>('book');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [watchingVideo, setWatchingVideo] = useState<Video | null>(null);

  // Protect Route
  useEffect(() => {
    if (loading === false && !user) router.push("/login");
  }, [user, loading, router]);

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const venueData = await getVenues();
      setVenues(venueData);
      
      const matchData = await getOpenMatches();
      setOpenMatches(matchData);
      
      const topPlayers = await getLeaderboard();
      setLeaderboard(topPlayers);
      
      const profile = await getUserProfile(user);
      setBalance(profile.balance || 0);
    };
    loadData();
  }, [user]);
  
  // 👂 Listen for Invites
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user]);

  const handleJoin = async (matchId: string) => {
    if (!user) return;
    try {
      await joinMatch(matchId, user.uid);
      alert("You joined the match! 🎾");
      const updated = await getOpenMatches();
      setOpenMatches(updated);
    } catch (e: unknown) {
      if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("An unexpected error occurred");
      }
    }
  };
  
  const handleChallenge = async (opponentId: string) => {
    if (!user) return;
    if (confirm("Send a challenge invitation? 📩")) {
        try {
            await sendChallengeInvite(user, opponentId);
            alert("Invitation sent! Wait for them to accept.");
        } catch (e) {
            alert("Could not send invite.");
        }
    }
  };
  
  const handleAcceptInvite = async (notif: Notification) => {
    try {
        const matchId = await respondToInvite(notif, true);
        if (matchId) {
            router.push(`/match/${matchId}`); // 🚀 Go to the new match!
        }
    } catch (e) {
        console.error(e);
        alert("Error accepting invite");
    }
  };

  const handleLogout = () => { auth.signOut(); router.push("/"); };

  if (loading || !user) return <div className="min-h-screen bg-padel-dark flex items-center justify-center text-padel-lime animate-pulse">Loading PadelPal...</div>;

  return (
    <div className="min-h-screen bg-padel-dark text-white pb-20">
      
      {/* --- HEADER --- */}
        <header className="px-6 pt-8 pb-4 flex justify-between items-center max-w-lg mx-auto md:max-w-4xl">
             <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Hi, {user.email?.split('@')[0]} <span className="animate-wave">👋</span>
                    </h1>
                    <p className="text-gray-400 text-sm">Let's play!</p>
                </div>
                
                <div className="flex items-center gap-4">
                     {/* 💰 Wallet Pill */}
                    <Link href="/topup" className="hidden md:flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-full border border-gray-700 hover:border-padel-lime transition mr-2">
                        <Wallet className="w-4 h-4 text-padel-lime" />
                        <span className="font-bold text-sm text-white">{balance} EGP</span>
                        <div className="w-5 h-5 bg-padel-lime rounded-full flex items-center justify-center text-padel-dark font-bold text-xs">+</div>
                    </Link>

                    {/* 🔔 Notification Bell */}
                    <div className="relative">
                        <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 hover:bg-gray-800 rounded-full transition">
                            <Bell className="w-6 h-6 text-gray-300" />
                            {notifications.length > 0 && (
                                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-padel-dark animate-pulse"></span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {showNotifs && (
                            <div className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-2xl shadow-xl z-50 p-2">
                                <h3 className="text-sm font-bold text-gray-400 px-3 py-2 mb-1">Notifications</h3>
                                {notifications.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500 text-sm">No new invites 💤</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="bg-gray-700/50 p-3 rounded-xl mb-2">
                                            <p className="text-sm text-white mb-2">
                                                <span className="font-bold text-padel-lime">{notif.fromName}</span> challenged you! ⚔️
                                            </p>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleAcceptInvite(notif)}
                                                    className="flex-1 bg-padel-lime text-padel-dark text-xs font-bold py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" /> Accept
                                                </button>
                                                <button 
                                                    onClick={() => respondToInvite(notif, false)}
                                                    className="flex-1 bg-gray-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center gap-1 transition"
                                                >
                                                    <X className="w-3 h-3" /> Decline
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Profile Link */}
                    <Link href="/profile" className="w-10 h-10 bg-padel-lime rounded-full flex items-center justify-center text-padel-dark font-bold hover:scale-105 transition">
                        {user.email?.[0].toUpperCase()}
                    </Link>
                    
                    <button onClick={handleLogout} className="text-gray-500 hover:text-white"><LogOut className="w-5 h-5" /></button>
                </div>
        </header>

      {/* --- THE "BIG 4" BUTTONS --- */}
      <div className="grid grid-cols-4 gap-4 px-6 mb-8 max-w-lg mx-auto md:max-w-4xl">
        
        {/* Button 1: Book */}
        <button onClick={() => setActiveTab('book')} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'book' ? 'bg-padel-lime text-padel-dark scale-110 shadow-[0_0_15px_rgba(210,230,3,0.3)]' : 'bg-gray-800 text-white group-hover:bg-gray-700'}`}>
                <Calendar className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${activeTab === 'book' ? 'text-white' : 'text-gray-400'}`}>Book</span>
        </button>

        {/* Button 2: Matches */}
        <button onClick={() => setActiveTab('match')} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'match' ? 'bg-padel-lime text-padel-dark scale-110 shadow-[0_0_15px_rgba(210,230,3,0.3)]' : 'bg-gray-800 text-white group-hover:bg-gray-700'}`}>
                <Search className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${activeTab === 'match' ? 'text-white' : 'text-gray-400'}`}>Matches</span>
        </button>

        {/* Button 3: Compete */}
        <button onClick={() => setActiveTab('compete')} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'compete' ? 'bg-padel-lime text-padel-dark scale-110 shadow-[0_0_15px_rgba(210,230,3,0.3)]' : 'bg-gray-800 text-white group-hover:bg-gray-700'}`}>
                <Trophy className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${activeTab === 'compete' ? 'text-white' : 'text-gray-400'}`}>Compete</span>
        </button>
        
        {/* Button 4: Learn (NOW ACTIVE 🎓) */}
        <button onClick={() => setActiveTab('learn')} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === 'learn' ? 'bg-padel-lime text-padel-dark scale-110 shadow-[0_0_15px_rgba(210,230,3,0.3)]' : 'bg-gray-800 text-white group-hover:bg-gray-700'}`}>
                <BookOpen className="w-6 h-6" />
            </div>
            <span className={`text-xs font-medium ${activeTab === 'learn' ? 'text-white' : 'text-gray-400'}`}>Learn</span>
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="px-6 max-w-lg mx-auto md:max-w-4xl min-h-[300px]">
        
        {/* VIEW 1: BOOK (VENUES) */}
        {activeTab === 'book' && (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Clubs</h2>
                    <Link href="/admin" className="flex items-center gap-1 text-sm text-padel-lime font-semibold hover:underline">
                        <PlusCircle className="w-4 h-4" />
                        Add Venue
                    </Link>
                </div>
                
                {venues.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-gray-700 rounded-xl">
                        <p className="text-gray-400 mb-2">No venues found.</p>
                        <p className="text-sm text-gray-500">Click &quot;Add Venue&quot; to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {venues.map((venue) => (
                            <Link href={`/book/${venue.id}`} key={venue.id} className="block group">
                                <div className="bg-padel-surface rounded-2xl overflow-hidden border border-gray-800 group-hover:border-padel-lime transition shadow-lg flex flex-col md:flex-row h-auto md:h-32">
                                    <div className="h-32 md:h-full w-full md:w-32 bg-gray-700 relative shrink-0">
                                        <Image 
                                            src={venue.image || "https://placehold.co/600x400/1E293B/D2E603?text=Padel"} 
                                            alt={venue.name} 
                                            width={500}
                                            height={300}
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg">{venue.name}</h3>
                                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {venue.location}
                                            </p>
                                        </div>
                                        <div className="bg-padel-lime text-padel-dark font-bold px-4 py-2 rounded-lg text-sm shrink-0 ml-2">
                                            Book
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* VIEW 2: MATCHES */}
        {activeTab === 'match' && (
            <div className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Open Matches</h2>
                {openMatches.length === 0 ? (
                    <div className="text-center py-10 bg-padel-surface rounded-2xl border border-dashed border-gray-700">
                        <p className="text-gray-400 mb-2">No open matches found.</p>
                        <button onClick={() => setActiveTab('book')} className="text-padel-lime text-sm font-bold hover:underline">
                            Create one now!
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {openMatches.map((match) => (
                            <div key={match.id} className="bg-padel-surface p-5 rounded-2xl border border-gray-800 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg">{match.courtName}</h3>
                                    <span className="bg-padel-lime text-padel-dark text-xs font-bold px-2 py-1 rounded">{match.pricePerPlayer} EGP</span>
                                </div>
                                <div className="text-sm text-gray-400 mb-4 flex gap-4">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {match.date}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {match.startTime}</span>
                                </div>
                                <button 
                                    onClick={() => handleJoin(match.id!)}
                                    disabled={match.players.includes(user.uid)}
                                    className="w-full bg-gray-700 hover:bg-padel-lime hover:text-padel-dark text-white py-2 rounded-lg text-sm font-bold transition"
                                >
                                    {match.players.includes(user.uid) ? "Joined" : "Join Match"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* VIEW 3: LEADERBOARD 🏆 */}
        {activeTab === 'compete' && (
            <div className="animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Global Rankings</h2>
                    <p className="text-gray-400 text-sm">Top players in PadelPal</p>
                </div>

                <div className="bg-padel-surface rounded-3xl border border-gray-800 overflow-hidden">
                    {leaderboard.map((player, index) => {
                        // Styling for Top 3
                        let rankColor = "text-gray-400 font-medium";
                        let icon = null;
                        if (index === 0) { rankColor = "text-yellow-400 font-bold text-xl"; icon = "🥇"; }
                        if (index === 1) { rankColor = "text-gray-300 font-bold text-lg"; icon = "🥈"; }
                        if (index === 2) { rankColor = "text-orange-400 font-bold text-lg"; icon = "🥉"; }

                        const isMe = player.uid === user.uid;

                        return (
                            <div key={player.uid} className={`flex items-center justify-between p-4 border-b border-gray-800 ${isMe ? 'bg-gray-800/50' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-8 text-center ${rankColor}`}>
                                        {icon || `#${index + 1}`}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isMe ? 'bg-padel-lime text-padel-dark' : 'bg-gray-700 text-white'}`}>
                                            {player.displayName?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className={`text-sm ${isMe ? 'text-padel-lime font-bold' : 'text-white font-medium'}`}>
                                                {player.displayName} {isMe && "(You)"}
                                            </div>
                                            <div className="text-[10px] text-gray-500">{player.matchesPlayed} Matches • {player.wins} Wins</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">{player.level.toFixed(2)}</div>
                                        <div className="text-[10px] text-gray-500">Level</div>
                                    </div>
                                    {!isMe && <button onClick={() => handleChallenge(player.uid)} className="bg-gray-700 hover:bg-padel-lime hover:text-padel-dark text-white text-xs font-bold py-2 px-3 rounded-lg transition">Challenge</button>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* VIEW 4: LEARN / ACADEMY 🎓 */}
        {activeTab === 'learn' && (
            <div className="animate-fade-in pb-24">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Padel Academy</h2>
                    <p className="text-gray-400 text-sm">Master the game</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {VIDEO_LIBRARY.map((video) => (
                        <div 
                            key={video.id} 
                            onClick={() => setWatchingVideo(video)}
                            className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer group relative border border-gray-700 hover:border-padel-lime transition"
                        >
                            {/* Thumbnail */}
                            <div className="relative h-40 bg-black">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-padel-lime/90 rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-lg">
                                        <Play className="w-5 h-5 text-padel-dark ml-1 fill-current" />
                                    </div>
                                </div>
                                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                    {video.category}
                                </span>
                            </div>
                            
                            {/* Title */}
                            <div className="p-4">
                                <h3 className="font-bold text-white text-sm group-hover:text-padel-lime transition">{video.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>

      {/* 📺 Video Modal */}
      {watchingVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-3xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative">
                
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-800">
                    <h3 className="font-bold text-white">{watchingVideo.title}</h3>
                    <button onClick={() => setWatchingVideo(null)} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* YouTube Embed */}
                <div className="aspect-video w-full">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${watchingVideo.youtubeId}?autoplay=1`} 
                        title="YouTube video player" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}