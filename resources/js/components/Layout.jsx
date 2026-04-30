import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/welcome');
    };

    const navItems = [
        { to: '/', label: 'Feed', icon: '🏠' },
        { to: '/events', label: 'Events', icon: '📅' },
        { to: '/devotionals', label: 'Devotionals', icon: '📖' },
        { to: '/challenges', label: 'Challenges', icon: '⚡' },
        { to: '/quizzes', label: 'Quizzes', icon: '🎯' },
        { to: '/music', label: 'Music', icon: '🎵' },
        { to: '/chat', label: 'Chat', icon: '💬' },
        { to: '/prayers', label: 'Prayers', icon: '🙏' },
        { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <nav className="bg-white/80 backdrop-blur-md shadow-lg shadow-purple-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">YouthFaith</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => `
                                        px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                                        ${isActive 
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                                            : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}
                                    `}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-3 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full">
                                        <span className="text-sm">⭐ {user.points || 0}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-sm">🔥 {user.streak || 0}</span>
                                    </div>
                                    {user.is_admin && (
                                        <NavLink to="/admin" className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                                        ⚙️ Admin
                                    </NavLink>
                                    )}
                                    <NavLink to={`/profile/${user.id}`} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                    </NavLink>
                                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 text-sm transition-colors">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <NavLink to="/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                                    Login
                                </NavLink>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-6xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}