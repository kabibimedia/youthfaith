import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import AdminPanel from './AdminPanel';

const EMOJI_OPTIONS = ['⚡', '🙏', '📖', '🎵', '🛡️', '✝️', '🔥', '💪', '🌟', '❤️', '🎯', '🏃', '💎', '🌱', '🤝', '🎉', '🕊️', '📿'];

const EMOJI_GRADIENTS = {
    '⚡': 'from-yellow-400 to-orange-500',
    '🙏': 'from-pink-400 to-rose-500',
    '📖': 'from-blue-400 to-indigo-500',
    '🎵': 'from-violet-400 to-purple-500',
    '🛡️': 'from-gray-400 to-slate-500',
    '✝️': 'from-amber-400 to-yellow-500',
    '🔥': 'from-red-400 to-orange-500',
    '💪': 'from-emerald-400 to-teal-500',
    '🌟': 'from-amber-300 to-yellow-500',
    '❤️': 'from-red-400 to-pink-500',
    '🎯': 'from-cyan-400 to-blue-500',
    '🏃': 'from-lime-400 to-green-500',
    '💎': 'from-sky-300 to-blue-400',
    '🌱': 'from-green-400 to-emerald-500',
    '🤝': 'from-teal-400 to-cyan-500',
    '🎉': 'from-purple-400 to-pink-500',
    '🕊️': 'from-white to-gray-300',
    '📿': 'from-amber-400 to-orange-500',
};

function daysRemaining(endDate) {
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / 86400000));
}

function durationDays(startDate, endDate) {
    const diff = new Date(endDate) - new Date(startDate);
    return Math.ceil(diff / 86400000);
}

function progressPercent(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return ((now - start) / (end - start)) * 100;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChallengesPanel() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', emoji: '', points: '',
        start_date: '', end_date: '',
    });
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => { loadChallenges(); }, [search, dateFrom, dateTo]);

    const hasDateFilter = dateFrom || dateTo;

    const clearDates = () => {
        setDateFrom('');
        setDateTo('');
    };

    const loadChallenges = async () => {
        try {
            const params = { search };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            const res = await adminService.getChallenges(params);
            setChallenges(res.data.data || res.data);
        } catch {} finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await adminService.updateChallenge(editing.id, form);
            } else {
                await adminService.createChallenge(form);
            }
            closeModal();
            loadChallenges();
        } catch { alert('Failed to save challenge'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this challenge?')) return;
        try {
            await adminService.deleteChallenge(id);
            loadChallenges();
        } catch { alert('Failed to delete'); }
    };

    const openEdit = (ch) => {
        setEditing(ch);
        setForm({
            title: ch.title,
            description: ch.description || '',
            emoji: ch.emoji || '',
            points: ch.points || '',
            start_date: ch.start_date ? new Date(ch.start_date).toISOString().split('T')[0] : '',
            end_date: ch.end_date ? new Date(ch.end_date).toISOString().split('T')[0] : '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ title: '', description: '', emoji: '', points: '', start_date: '', end_date: '' });
    };

    if (loading) {
        return (
            <AdminPanel title="Challenges">
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-100 rounded w-32" />
                                    <div className="h-3 bg-gray-100 rounded w-24" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-2.5 bg-gray-100 rounded w-full" />
                                <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full mt-4" />
                        </div>
                    ))}
                </div>
            </AdminPanel>
        );
    }

    const actionBtn = (
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', emoji: '', points: '', start_date: '', end_date: '' }); setShowModal(true); }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
            + Add Challenge
        </button>
    );

    return (
        <AdminPanel
            title={`Challenges (${challenges.length})`}
            search={search}
            onSearch={(e) => setSearch(e.target.value)}
            searchPlaceholder="Search challenges..."
            action={actionBtn}
        >
            <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">From</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">To</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                {hasDateFilter && (
                    <button onClick={clearDates} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                        ✕ Clear dates
                    </button>
                )}
            </div>

            {challenges.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-4">
                        ⚡
                    </div>
                    <p className="text-gray-500 font-medium">No challenges found</p>
                    <p className="text-gray-400 text-sm mt-1">{hasDateFilter || search ? 'Try adjusting your filters' : 'Create your first challenge to get started'}</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {challenges.map(ch => {
                        const remaining = daysRemaining(ch.end_date);
                        const totalDays = durationDays(ch.start_date, ch.end_date);
                        const progress = progressPercent(ch.start_date, ch.end_date);
                        const isExpired = remaining === 0 && progress >= 100;
                        const isUpcoming = new Date(ch.start_date) > new Date();

                        return (
                            <div key={ch.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${EMOJI_GRADIENTS[ch.emoji] || 'from-purple-400 to-pink-500'} flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                                                {ch.emoji || '⚡'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-base leading-tight">{ch.title}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                                                        ⭐ {ch.points} pts
                                                    </span>
                                                    {ch.users_count > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                                                            👥 {ch.users_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button onClick={() => openEdit(ch)}
                                                className="px-2.5 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(ch.id)}
                                                className="px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100">
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {ch.description && (
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3">{ch.description}</p>
                                    )}

                                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                        <span>📅 {formatDate(ch.start_date)}</span>
                                        <span>→</span>
                                        <span>{formatDate(ch.end_date)}</span>
                                        <span className="text-gray-300">·</span>
                                        <span>{totalDays} days</span>
                                    </div>

                                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                isExpired ? 'bg-gray-300' : isUpcoming ? 'bg-blue-400' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2">
                                            {isExpired ? (
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-medium">Expired</span>
                                            ) : isUpcoming ? (
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-medium">Upcoming</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-medium">
                                                    {remaining > 1 ? `${remaining} days left` : 'Last day!'}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${ch.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {ch.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {editing ? 'Edit Challenge' : 'Create Challenge'}
                        </h3>
                        <p className="text-xs text-gray-400 mb-5">Set up a new challenge for members</p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Emoji</label>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {EMOJI_OPTIONS.map(e => (
                                        <button key={e} type="button" onClick={() => setForm({ ...form, emoji: e })}
                                            className={`w-10 h-10 flex items-center justify-center text-lg rounded-xl border transition-all ${
                                                form.emoji === e ? 'border-purple-500 bg-purple-50 scale-110 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}>{e}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Points</label>
                                    <input type="number" min="1" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Active</label>
                                    <div className="h-[42px] flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <div className={`relative w-10 h-5 rounded-full transition-colors ${form.is_active !== false ? 'bg-emerald-400' : 'bg-gray-200'}`}
                                                onClick={() => setForm({ ...form, is_active: form.is_active === false ? true : false })}>
                                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="text-sm text-gray-600">{form.is_active !== false ? 'Yes' : 'No'}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
                                    <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">End Date</label>
                                    <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
                                    {editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminPanel>
    );
}