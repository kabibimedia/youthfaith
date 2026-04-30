import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import UsersPanel from '../components/admin/UsersPanel';
import PostsPanel from '../components/admin/PostsPanel';
import EventsPanel from '../components/admin/EventsPanel';
import PrayersPanel from '../components/admin/PrayersPanel';
import AnnouncementsPanel from '../components/admin/AnnouncementsPanel';

export default function Admin() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.is_admin) {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        try {
            const res = await adminService.getDashboard();
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!user || !user.is_admin) {
        return <Navigate to="/" replace />;
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'posts', label: 'Posts', icon: '📝' },
        { id: 'events', label: 'Events', icon: '📅' },
        { id: 'prayers', label: 'Prayers', icon: '🙏' },
        { id: 'announcements', label: 'Announcements', icon: '📢' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats stats={stats} loading={loading} />;
            case 'users':
                return <UsersPanel />;
            case 'posts':
                return <PostsPanel />;
            case 'events':
                return <EventsPanel />;
            case 'prayers':
                return <PrayersPanel />;
            case 'announcements':
                return <AnnouncementsPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <a href="/" className="text-purple-600 hover:text-purple-700">← Back to Site</a>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    <nav className="w-56 shrink-0">
                        <div className="bg-white rounded-lg shadow-sm p-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-purple-100 text-purple-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <main className="flex-1">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}

function DashboardStats({ stats, loading }) {
    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    const statCards = [
        { label: 'Total Users', value: stats?.stats.total_users, icon: '👥', color: 'bg-blue-500' },
        { label: 'Total Posts', value: stats?.stats.total_posts, icon: '📝', color: 'bg-green-500' },
        { label: 'Total Events', value: stats?.stats.total_events, icon: '📅', color: 'bg-yellow-500' },
        { label: 'Total Prayers', value: stats?.stats.total_prayers, icon: '🙏', color: 'bg-pink-500' },
        { label: 'Active Users (7d)', value: stats?.stats.active_users, icon: '🔥', color: 'bg-purple-500' },
        { label: 'New Users Today', value: stats?.stats.new_users_today, icon: '✨', color: 'bg-indigo-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                        <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mb-4`}>
                            {stat.icon}
                        </div>
                        <div className="text-3xl font-bold text-gray-800">{stat.value || 0}</div>
                        <div className="text-gray-500 text-sm">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                        {stats?.recent_users?.slice(0, 5).map(u => (
                            <div key={u.id} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                                    {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email}</div>
                                </div>
                            </div>
                        )) || <div className="text-gray-500">No users yet</div>}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Posts</h3>
                    <div className="space-y-3">
                        {stats?.recent_posts?.slice(0, 5).map(p => (
                            <div key={p.id} className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm">
                                    📝
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-800 truncate">{p.content}</div>
                                    <div className="text-sm text-gray-500">by {p.user?.name}</div>
                                </div>
                            </div>
                        )) || <div className="text-gray-500">No posts yet</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}