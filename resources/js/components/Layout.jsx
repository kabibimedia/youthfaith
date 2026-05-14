import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountPanel from './account/AccountPanel';

export default function Layout() {
    const { user, logout, justLoggedIn, setJustLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        if (justLoggedIn && user) {
            setShowWelcome(true);
            const timer = setTimeout(() => {
                setShowWelcome(false);
                setJustLoggedIn(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [justLoggedIn, user]);

    const handleLogout = async () => {
        await logout();
        navigate('/welcome');
    };

    const navItems = [
        { to: '/', label: 'Feed', icon: '🏠' },
        { to: '/events', label: 'Events', icon: '📅' },
        { to: '/devotionals', label: 'Devotionals', icon: '📖' },
        { to: '/blogs', label: 'Blog', icon: '📝' },
        { to: '/challenges', label: 'Challenges', icon: '⚡' },
        { to: '/quizzes', label: 'Quizzes', icon: '🎯' },
        { to: '/music', label: 'Music', icon: '🎵' },
        { to: '/chat', label: 'Chat', icon: '💬' },
        { to: '/prayers', label: 'Prayers', icon: '🙏' },
        { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <nav className="bg-white/80 backdrop-blur-md shadow-lg shadow-purple-100 fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                            </svg>
                        </button>
                        <NavLink to="/" className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            YouthFaith
                        </NavLink>
                    </div>
                    <div className="flex items-center gap-3">
                        {user ? (
                            <>
                                {user.is_admin && (
                                    <NavLink to="/admin" className="hidden sm:block px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all">
                                        ⚙️ Admin
                                    </NavLink>
                                )}
                                <NavLink to={`/profile/${user.id}`} className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                </NavLink>
                            </>
                        ) : (
                            <NavLink to="/login" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/90 backdrop-blur-md border-r border-gray-200 z-40 transform transition-transform duration-200 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0`}
            >
                <nav className="p-3 space-y-1 overflow-y-auto h-full flex flex-col">
                    {user && (
                        <AccountPanel />
                    )}
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}
                            `}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <main className={`pt-16 px-4 py-6 transition-all duration-200 md:ml-64`}>
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {showWelcome && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl animate-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-4">
                            <span className="text-4xl">👋</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
                        <p className="text-gray-500 text-lg">{user?.firstname || user?.username || 'Friend'}</p>
                        <p className="text-gray-400 text-sm mt-1">Glad to see you again</p>
                        <button
                            onClick={() => { setShowWelcome(false); setJustLoggedIn(false); }}
                            className="mt-6 w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
                        >
                            Let's go!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
