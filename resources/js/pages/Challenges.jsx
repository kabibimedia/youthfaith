import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { challengeService } from '../services/api';

const sampleChallenges = [
    { id: 0, title: "Gratitude Challenge", description: "Post 3 things you're grateful for today!", emoji: "🙏", points: 50, start_date: "2026-04-01", end_date: "2026-04-07", is_active: true },
    { id: 1, title: "Bible Reader", description: "Read any 5 chapters of the Bible this week", emoji: "📖", points: 100, start_date: "2026-04-01", end_date: "2026-04-30", is_active: true },
    { id: 2, title: "Prayer Warrior", description: "Pray for 3 different people today", emoji: "🛡️", points: 30, start_date: "2026-04-03", end_date: "2026-04-03", is_active: true },
    { id: 3, title: "Share Your Faith", description: "Share your testimony with a friend this week", emoji: "✝️", points: 75, start_date: "2026-04-01", end_date: "2026-04-30", is_active: true },
    { id: 4, title: "Worship Leader", description: "Listen to 3 worship songs and rate them", emoji: "🎵", points: 25, start_date: "2026-04-03", end_date: "2026-04-03", is_active: true },
];

export default function Challenges() {
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadChallenges();
    }, []);

    const loadChallenges = async () => {
        try {
            const res = await challengeService.getChallenges();
            if (res.data.length === 0) {
                setChallenges(sampleChallenges);
            } else {
                setChallenges(res.data);
            }
        } catch (err) {
            console.error(err);
            setChallenges(sampleChallenges);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (id) => {
        try {
            await challengeService.joinChallenge(id);
            loadChallenges();
        } catch (err) {
            console.error(err);
        }
    };

    const handleComplete = async (id) => {
        try {
            const res = await challengeService.completeChallenge(id);
            alert(`🎉 Challenge Complete! You earned ${res.data.points_earned} points!`);
            loadChallenges();
        } catch (err) {
            alert(err.response?.data?.message || 'Error completing challenge');
        }
    };

    const getDaysLeft = (endDate) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-3">Loading challenges...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">
                    ⚡ Youth Challenges
                </h1>
                <p className="text-gray-500 mt-2">Complete challenges, earn points, grow in faith!</p>
            </div>

            {user && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-80">Your Stats</p>
                            <div className="flex gap-6 mt-2">
                                <div>
                                    <p className="text-3xl font-bold">⭐ {user.points || 0}</p>
                                    <p className="text-xs opacity-80">Points</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">🔥 {user.streak || 0}</p>
                                    <p className="text-xs opacity-80">Day Streak</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-6xl">🏆</div>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {challenges.map(challenge => {
                    const daysLeft = getDaysLeft(challenge.end_date);
                    const isExpired = daysLeft < 0;
                    const isToday = daysLeft === 0;

                    return (
                        <div key={challenge.id} className={`relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all hover:scale-[1.01] ${
                            challenge.completed 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                                : isExpired
                                    ? 'bg-gray-100 opacity-60'
                                    : 'bg-white border border-purple-100 hover:shadow-xl'
                        }`}>
                            <div className="flex items-start gap-4">
                                <div className="text-5xl">{challenge.emoji}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`text-xl font-bold ${challenge.completed ? 'text-white' : 'text-gray-800'}`}>
                                            {challenge.title}
                                        </h3>
                                        {challenge.completed && <span className="text-xl">✅</span>}
                                    </div>
                                    <p className={`mb-3 ${challenge.completed ? 'text-white/90' : 'text-gray-600'}`}>
                                        {challenge.description}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            challenge.completed 
                                                ? 'bg-white/20 text-white'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            ⭐ {challenge.points} pts
                                        </span>
                                        <span className={`text-sm ${challenge.completed ? 'text-white/80' : 'text-gray-500'}`}>
                                            {isExpired ? 'Ended' : isToday ? 'Ends today!' : `${daysLeft} days left`}
                                        </span>
                                        {challenge.participant_count > 0 && (
                                            <span className={`text-sm ${challenge.completed ? 'text-white/80' : 'text-gray-500'}`}>
                                                👥 {challenge.participant_count} joined
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {user && !challenge.completed && !isExpired && (
                                    <div className="flex flex-col gap-2">
                                        {!challenge.joined ? (
                                            <button onClick={() => handleJoin(challenge.id)} 
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all">
                                                Join 🚀
                                            </button>
                                        ) : (
                                            <button onClick={() => handleComplete(challenge.id)} 
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all">
                                                Complete ✅
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!user && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-600">Login to join challenges and earn points!</p>
                </div>
            )}
        </div>
    );
}
