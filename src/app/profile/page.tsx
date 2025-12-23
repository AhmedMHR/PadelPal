'use client';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '@/services/userService';
import { getUserBookings, Booking } from '@/services/bookingService';
import { uploadProfileImage } from '@/services/storageService';
import { Edit2, Save, LogOut, Calendar, Clock, MapPin, Camera, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    getUserProfile(user).then((p) => {
      setProfile(p);
      setNewName(p.displayName || user.email?.split('@')[0] || '');
    });

    getUserBookings(user.uid).then(setHistory);
  }, [user]);

  const handleSave = async () => {
    if (!user || !newName.trim()) return;
    await updateUserProfile(user.uid, { displayName: newName });
    setProfile((prev) => (prev ? { ...prev, displayName: newName } : null));
    setIsEditing(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!user || !profile || !file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    try {
      setUploadingImage(true);
      const newPhotoURL = await uploadProfileImage(user.uid, file);
      await updateUserProfile(user.uid, { photoURL: newPhotoURL });
      setProfile({ ...profile, photoURL: newPhotoURL });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Try again.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!profile) return <div className="min-h-screen bg-padel-dark text-white flex items-center justify-center">Loading Stats...</div>;

  const winRate = profile.matchesPlayed > 0 ? Math.round((profile.wins / profile.matchesPlayed) * 100) : 0;

  return (
    <div className="min-h-screen bg-padel-dark text-white pb-24">
      <div className="bg-gradient-to-b from-gray-800 to-padel-dark p-8 pb-12 border-b border-gray-800">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="relative group w-24 h-24 mb-4">
            <div className="w-full h-full bg-padel-lime rounded-full flex items-center justify-center text-3xl font-bold text-padel-dark overflow-hidden shadow-[0_0_30px_rgba(210,230,3,0.3)]">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.displayName?.[0].toUpperCase() || 'U'
              )}
            </div>
            <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    // 👇 UPDATED LOGIC HERE:
                    // If uploading, force opacity-100. If not, hide it until hover (opacity-0 group-hover:opacity-100)
                    className={`absolute inset-0 bg-black/60 rounded-full flex items-center justify-center transition-opacity cursor-pointer ${                        uploadingImage ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                >
                    {uploadingImage ? (
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                        <Camera className="w-8 h-8 text-white/80 hover:text-white transition" />
                    )}
                </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" className="hidden" />
          </div>

          {isEditing ? (
            <div className="flex gap-2 mb-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded-lg outline-none border border-padel-lime"
              />
              <button onClick={handleSave} className="bg-padel-lime text-padel-dark p-2 rounded-lg">
                <Save className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              {profile.displayName || 'Unknown Player'}
              <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-white">
                <Edit2 className="w-4 h-4" />
              </button>
            </h1>
          )}

          <div className="text-padel-lime font-mono text-sm mb-6">ID: {user?.uid.slice(0, 6)}</div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-md">
            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
              <div className="text-2xl font-bold">{profile.level.toFixed(2)}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Level</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
              <div className="text-2xl font-bold">{profile.matchesPlayed}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Matches</div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
              <div className="text-2xl font-bold text-padel-lime">{winRate}%</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Win Rate</div>
            </div>
          </div>

          <button
            onClick={() => {
              auth.signOut();
              router.push('/login');
            }}
            className="mt-8 flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-padel-lime" /> Match History
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No matches played yet. Go compete! 🎾</div>
        ) : (
          <div className="space-y-4">
            {history.map((match) => {
              const isWinner = match.winners?.includes(user!.uid);
              const isFinished = match.status === 'finished';

              let borderColor = 'border-gray-800';
              if (isFinished) borderColor = isWinner ? 'border-green-500/50' : 'border-red-500/50';

              return (
                <div key={match.id} className={`bg-padel-surface p-4 rounded-xl border ${borderColor} flex justify-between items-center`}>
                  <div>
                    <div className="text-sm font-bold text-gray-300 mb-1 flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {match.courtName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {match.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {match.startTime}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isFinished ? (
                      <>
                        <div className="text-xl font-bold font-mono">{match.score}</div>
                        <div className={`text-[10px] font-bold uppercase ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
                          {isWinner ? 'Victory 🏆' : 'Defeat 💀'}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">Played / Pending</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
