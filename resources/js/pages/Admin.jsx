import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import UsersPanel from '../components/admin/UsersPanel';
import PostsPanel from '../components/admin/PostsPanel';
import EventsPanel from '../components/admin/EventsPanel';
import PrayersPanel from '../components/admin/PrayersPanel';
import AnnouncementsPanel from '../components/admin/AnnouncementsPanel';
import BlogsPanel from '../components/admin/BlogsPanel';
import ChallengesPanel from '../components/admin/ChallengesPanel';
import QuizzesPanel from '../components/admin/QuizzesPanel';
import DuesPanel from '../components/admin/DuesPanel';
import SlidersPanel from '../components/admin/SlidersPanel';
import ClientsPanel from '../components/admin/ClientsPanel';
import AdminsPanel from '../components/admin/AdminsPanel';
import ActivityLogsPanel from '../components/admin/ActivityLogsPanel';
import StreamingPanel from '../components/admin/StreamingPanel';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥', countKey: 'total_users' },
    { id: 'posts', label: 'Posts', icon: '📝', countKey: 'total_posts' },
    { id: 'events', label: 'Events', icon: '📅', countKey: 'total_events' },
    { id: 'prayers', label: 'Prayers', icon: '🙏', countKey: 'total_prayers' },
    { id: 'challenges', label: 'Challenges', icon: '⚡', countKey: 'total_challenges' },
    { id: 'blogs', label: 'Blogs', icon: '📝', countKey: 'total_blogs' },
    { id: 'quizzes', label: 'Quizzes', icon: '🎯', countKey: 'total_quizzes' },
    { id: 'dues', label: 'Dues', icon: '💳', pendingKey: 'dues_pending', countKey: 'dues_total' },
    { id: 'clients', label: 'Clients', icon: '👤', countKey: 'total_clients' },
    { id: 'sliders', label: 'Sliders', icon: '🖼️', countKey: 'total_sliders' },
    { id: 'announcements', label: 'Announcements', icon: '📢', countKey: 'total_announcements' },
    { id: 'streaming', label: 'Streaming', icon: '🔴' },
];

export default function Admin() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingCounts, setPendingCounts] = useState({});

    useEffect(() => {
        if (user && user.is_admin) {
            loadDashboard();
        }
    }, [user]);

    const loadDashboard = async () => {
        try {
            const res = await adminService.getDashboard();
            setStats(res.data);
            const pending = {};
            const s = res.data?.stats || {};
            if (res.data?.pending_payments?.length > 0) {
                pending.dues_pending = res.data.pending_payments.length;
            }
            const s2 = res.data?.payment_status_stats || {};
            pending.dues_total = (s2.approved || 0) + (s2.pending || 0) + (s2.rejected || 0);
            pending.total_users = s.total_users || 0;
            pending.total_posts = s.total_posts || 0;
            pending.total_events = s.total_events || 0;
            pending.total_prayers = s.total_prayers || 0;
            pending.total_challenges = s.total_challenges || 0;
            pending.total_blogs = s.total_blogs || 0;
            pending.total_quizzes = s.total_quizzes || 0;
            pending.total_clients = s.total_clients || 0;
            pending.total_sliders = s.total_sliders || 0;
            pending.total_announcements = s.total_announcements || 0;
            setPendingCounts(pending);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-950 to-violet-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!user || !user.is_admin) {
        return <Navigate to="/" replace />;
    }

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
            case 'challenges':
                return <ChallengesPanel />;
            case 'blogs':
                return <BlogsPanel />;
            case 'quizzes':
                return <QuizzesPanel />;
            case 'dues':
                return <DuesPanel />;
            case 'clients':
                return <ClientsPanel />;
            case 'sliders':
                return <SlidersPanel />;
            case 'announcements':
                return <AnnouncementsPanel />;
            case 'super-admins':
                return <AdminsPanel />;
            case 'activity-logs':
                return <ActivityLogsPanel />;
            case 'streaming':
                return <StreamingPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-indigo-950 via-purple-950 to-violet-950 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-purple-500/30">
                                {user.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <p className="text-white text-sm font-semibold leading-tight">{user.name}</p>
                                <p className="text-white/40 text-[10px]">{user.role === 'super_admin' ? 'Super Admin' : 'Administrator'}</p>
                            </div>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/50 hover:text-white text-xl">&times;</button>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {[...NAV_ITEMS, ...(user?.role === 'super_admin' ? [
                            { id: 'super-admins', label: 'Admins', icon: '👑' },
                            { id: 'activity-logs', label: 'Activity Log', icon: '📜' },
                        ] : [])].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                                    activeTab === item.id
                                        ? 'bg-white/15 text-white shadow-sm border-l-2 border-purple-400'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>
                                    {item.label}
                                    {item.countKey && pendingCounts[item.countKey] > 0 && (
                                        <span className="ml-1.5 text-white/50 text-xs font-medium">({pendingCounts[item.countKey]})</span>
                                    )}
                                </span>
                                {item.pendingKey && pendingCounts[item.pendingKey] > 0 && (
                                    <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
                                        {pendingCounts[item.pendingKey]}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <div className="px-3 py-4 border-t border-white/10">
                        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
                            <span>←</span>
                            <span>Back to Site</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 text-xl">
                                ☰
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {NAV_ITEMS.find(t => t.id === activeTab)?.label || 'Admin'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                System Online
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

function DashboardStats({ stats, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse border border-gray-100">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
                            <div className="h-7 bg-gray-100 rounded-lg w-3/4 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-72" />
                    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse h-72" />
                </div>
            </div>
        );
    }

    const s = stats?.stats || {};
    const monthly = stats?.monthly_dues || [];
    const statusStats = stats?.payment_status_stats || {};
    const types = stats?.type_distribution || {};
    const growth = stats?.member_growth || [];
    const totalPayments = statusStats.approved + statusStats.pending + statusStats.rejected || 1;
    const totalDues = types.dues + types.contribution + types.pledge || 1;

    const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
    const TYPE_COLORS = ['#8b5cf6', '#06b6d4', '#f97316'];

    const statusPie = [
        { name: 'Approved', value: statusStats.approved || 0 },
        { name: 'Pending', value: statusStats.pending || 0 },
        { name: 'Rejected', value: statusStats.rejected || 0 },
    ];

    const typePie = [
        { name: 'Dues', value: types.dues || 0 },
        { name: 'Contributions', value: types.contribution || 0 },
        { name: 'Pledges', value: types.pledge || 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Collection Rate</div>
                    <div className="text-2xl font-bold text-gray-900">{s.total_members > 0 ? ((s.total_dues_collected / (s.total_members * 100)) * 100).toFixed(0) : 0}%</div>
                    <div className="text-[11px] text-gray-400">of expected dues</div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${Math.min((s.total_dues_collected / ((s.total_members || 1) * 100)) * 100, 100)}%` }} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Avg per Member</div>
                    <div className="text-2xl font-bold text-gray-900">₵{s.total_members > 0 ? (s.total_dues_collected / s.total_members).toFixed(0) : 0}</div>
                    <div className="text-[11px] text-gray-400">lifetime contribution</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Approval Rate</div>
                    <div className="text-2xl font-bold text-gray-900">{((statusStats.approved || 0) / totalPayments * 100).toFixed(0)}%</div>
                    <div className="text-[11px] text-gray-400">{statusStats.approved || 0} of {statusStats.approved + statusStats.pending + statusStats.rejected} payments</div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">This Month</div>
                    <div className="text-2xl font-bold text-gray-900">₵{(s.dues_this_month || 0).toLocaleString()}</div>
                    <div className="text-[11px] text-gray-400">{((s.dues_this_month / (s.total_dues_collected || 1)) * 100).toFixed(0)}% of total</div>
                </div>
            </div>

            {stats?.featured_announcement && (
                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-5 shadow-sm text-white">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-white/20 text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">Featured on Feed</span>
                                <span className={`w-2 h-2 rounded-full ${stats.featured_announcement.is_active ? 'bg-green-300' : 'bg-gray-400'}`} />
                            </div>
                            <h3 className="font-bold text-lg leading-tight">{stats.featured_announcement.title}</h3>
                            <p className="text-white/80 text-sm mt-1 line-clamp-2">{stats.featured_announcement.content}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-[${stats.featured_announcement.type === 'success' ? '#10b981' : stats.featured_announcement.type === 'warning' ? '#f59e0b' : stats.featured_announcement.type === 'danger' ? '#ef4444' : '#3b82f6'}]/30`}>
                                {stats.featured_announcement.type}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Monthly Dues Collection</h3>
                            <p className="text-[11px] text-gray-400">Last 6 months</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Amount
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#10b981" maxBarSize={40}>
                                    {monthly.map((_, i) => (
                                        <Cell key={i} fill={i === monthly.length - 1 ? '#10b981' : '#d1fae5'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Payment Status</h3>
                            <p className="text-[11px] text-gray-400">Approved vs pending vs rejected</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-48 w-48 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                                        {statusPie.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {statusPie.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                    <span className="text-sm text-gray-600 w-20">{item.name}</span>
                                    <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                                    <span className="text-[11px] text-gray-400">({((item.value / totalPayments) * 100).toFixed(0)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Revenue by Type</h3>
                            <p className="text-[11px] text-gray-400">Dues vs contributions vs pledges</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-48 w-48 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={typePie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" stroke="none">
                                        {typePie.map((_, i) => (
                                            <Cell key={i} fill={TYPE_COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {typePie.map((item, i) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[i] }} />
                                    <span className="text-sm text-gray-600 w-24">{item.name}</span>
                                    <span className="text-sm font-semibold text-gray-900">₵{item.value.toLocaleString()}</span>
                                    <span className="text-[11px] text-gray-400">({((item.value / totalDues) * 100).toFixed(0)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Member Growth</h3>
                            <p className="text-[11px] text-gray-400">New registrations per month</p>
                        </div>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={growth} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }} />
                                <Line type="monotone" dataKey="registrations" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {stats?.pending_payments?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs">⏳</span>
                        <span className="text-sm font-semibold text-gray-900">Pending Approvals</span>
                        <span className="ml-auto text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{stats.pending_payments.length}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {stats.pending_payments.slice(0, 10).map(p => (
                            <div key={p.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 text-xs font-bold">
                                    {p.user?.name?.charAt(0) || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-800 truncate leading-tight">{p.user?.name}</div>
                                    <div className="text-xs text-amber-600 font-semibold">₵{parseFloat(p.amount).toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
