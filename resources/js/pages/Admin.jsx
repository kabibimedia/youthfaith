import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
        { id: 'dashboard', label: 'Dashboard', icon: '📊', count: null },
        { id: 'users', label: 'Users', icon: '👥', count: stats?.stats?.total_users },
        { id: 'posts', label: 'Posts', icon: '📝', count: stats?.stats?.total_posts },
        { id: 'events', label: 'Events', icon: '📅', count: stats?.stats?.total_events },
        { id: 'prayers', label: 'Prayers', icon: '🙏', count: stats?.stats?.total_prayers },
        { id: 'challenges', label: 'Challenges', icon: '⚡', count: stats?.stats?.total_challenges },
        { id: 'blogs', label: 'Blogs', icon: '📝', count: null },
        { id: 'quizzes', label: 'Quizzes', icon: '🎯', count: null },
        { id: 'dues', label: 'Dues', icon: '💳', count: stats?.stats?.pending_payments ? `${stats.stats.pending_payments} pending` : null },
        { id: 'clients', label: 'Clients', icon: '👤', count: stats?.stats?.total_members ? `${stats.stats.total_members}` : null },
        { id: 'sliders', label: 'Sliders', icon: '🖼️', count: null },
        { id: 'announcements', label: 'Announcements', icon: '📢', count: null },
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
                <div className="flex flex-col md:flex-row gap-6">
                    <nav className="w-full md:w-56 shrink-0 overflow-x-auto">
                        <div className="flex md:flex-col bg-white rounded-lg shadow-sm p-2 gap-1 md:gap-0">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`shrink-0 text-left px-3 md:px-4 py-3 rounded-lg flex items-center gap-2 md:gap-3 transition-colors text-sm ${
                                        activeTab === tab.id
                                            ? 'bg-purple-100 text-purple-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span className="flex-1 whitespace-nowrap">{tab.label}</span>
                                    {tab.count !== null && (
                                        <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{tab.count}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <main className="flex-1 min-w-0">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

function DashboardStats({ stats, loading }) {
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
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
    const totalMembers = s.total_members || 1;

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
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                                    formatter={(value) => [`₵${value.toLocaleString()}`, '']}
                                />
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