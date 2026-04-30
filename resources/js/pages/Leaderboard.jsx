import { useState, useEffect } from 'react';
import { userService } from '../services/api';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const res = await userService.getLeaderboard();
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (index) => {
        if (index === 0) return { bg: 'from-yellow-300 to-yellow-500', shadow: 'shadow-yellow-400/50', icon: '🥇' };
        if (index === 1) return { bg: 'from-gray-300 to-gray-400', shadow: 'shadow-gray-400/50', icon: '🥈' };
        if (index === 2) return { bg: 'from-orange-300 to-orange-400', shadow: 'shadow-orange-400/50', icon: '🥉' };
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                    🏆 Leaderboard
                </h1>
                <p className="text-gray-500 mt-2">Top believers earning points for their faith journey</p>
            </div>

            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-xl font-semibold text-gray-800">No users yet</h3>
                    <p className="text-gray-500">Be the first to join the leaderboard!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {users.map((user, index) => {
                        const rankStyle = getRankStyle(index);
                        return (
                            <div key={user.id} 
                                className={`relative bg-gradient-to-r ${
                                    rankStyle ? `${rankStyle.bg} text-white` : 'from-white to-purple-50'
                                } rounded-2xl p-6 shadow-lg transition-all hover:scale-[1.01] ${
                                    rankStyle ? rankStyle.shadow : 'shadow-purple-100'
                                }`}>
                                <div className="flex items-center gap-4">
                                    <div className={`text-4xl font-bold w-16 text-center ${
                                        rankStyle ? 'text-white' : 'text-gray-400'
                                    }`}>
                                        {rankStyle ? rankStyle.icon : `#${index + 1}`}
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold ${rankStyle ? 'text-white' : 'text-gray-800'}`}>
                                            {user.name}
                                        </h3>
                                        {user.username && (
                                            <p className={`text-sm ${rankStyle ? 'text-white/80' : 'text-gray-500'}`}>
                                                @{user.username}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${rankStyle ? 'text-white' : 'text-purple-600'}`}>
                                                ⭐ {user.points || 0}
                                            </div>
                                            <div className={`text-sm ${rankStyle ? 'text-white/70' : 'text-gray-500'}`}>Points</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${rankStyle ? 'text-white' : 'text-orange-500'}`}>
                                                🔥 {user.streak || 0}
                                            </div>
                                            <div className={`text-sm ${rankStyle ? 'text-white/70' : 'text-gray-500'}`}>Streak</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}