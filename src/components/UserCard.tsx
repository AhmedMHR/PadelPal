"use client";

import { User } from "@/context/AuthContext";
import { Swords } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { sendChallengeInvite } from "@/services/notificationService"; // CORRECT: Use the notification service
import { useRouter } from "next/navigation";

interface UserCardProps {
    player: User;
}

export default function UserCard({ player }: UserCardProps) {
    const { user } = useAuth();
    const router = useRouter();

    const handleChallenge = async () => {
        if (!user) {
            alert("You must be logged in to challenge a player.");
            return;
        }

        if (user.uid === player.uid) {
            alert("You cannot challenge yourself.");
            return;
        }

        if (confirm(`Challenge ${player.name} to a match?`)) {
            try {
                // CORRECT: Send an invite instead of creating a match directly
                await sendChallengeInvite(user, player.uid);
                alert("Challenge sent!"); // Give user feedback
            } catch (error) {
                console.error("Challenge Failed:", error);
                alert("Failed to send challenge.");
            }
        }
    };

    return (
        <div className="bg-padel-surface p-4 rounded-lg flex items-center justify-between">
            <div>
                <h3 className="font-bold">{player.name}</h3>
                <p className="text-sm text-gray-400">Level: {player.level.toFixed(1)}</p>
            </div>
            <button
                onClick={handleChallenge}
                className="bg-padel-lime text-padel-dark px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition"
            >
                <Swords className="w-4 h-4 mr-2 inline" />
                Challenge
            </button>
        </div>
    );
}