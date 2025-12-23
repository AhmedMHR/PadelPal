
"use client";
import { useState } from "react";
import { createVenue } from "@/services/venueService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, DollarSign, Image as ImageIcon, Plus } from "lucide-react";

export default function AdminPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    pricePerHour: 300,
    image: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createVenue({
        name: formData.name,
        location: formData.location,
        pricePerHour: Number(formData.pricePerHour),
        image: formData.image || "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2670&auto=format&fit=crop",
        amenities: ["WiFi", "Parking", "Cafe"],
        courts: 4
      });
      alert("Venue Created Successfully! 🏗️");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      alert("Error creating venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-padel-dark text-white p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold">Admin: Add Venue</h1>
        </div>

        <div className="bg-padel-surface p-8 rounded-3xl border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Club Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Smash Padel Club"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-padel-lime outline-none transition"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Location / City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Cairo, Egypt"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-padel-lime outline-none transition"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Price per Hour (EGP)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input 
                  required
                  type="number" 
                  placeholder="300"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-padel-lime outline-none transition"
                  value={formData.pricePerHour}
                  onChange={e => setFormData({...formData, pricePerHour: Number(e.target.value)})}
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-300">Cover Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-padel-lime outline-none transition"
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Leave empty for a default cool Padel image.</p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-padel-lime text-padel-dark font-bold py-4 rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(210,230,3,0.3)]"
            >
              {loading ? "Creating..." : <><Plus className="w-5 h-5" /> Create Venue</>}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
