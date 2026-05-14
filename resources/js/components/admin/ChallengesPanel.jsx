import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

const EMOJI_OPTIONS = ['⚡', '🙏', '📖', '🎵', '🛡️', '✝️', '🔥', '💪', '🌟', '❤️', '🎯', '🏃', '💎', '🌱', '🤝', '🎉', '🕊️', '📿'];

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

    useEffect(() => { loadChallenges(); }, [search]);

    const loadChallenges = async () => {
        try {
            const res = await adminService.getChallenges({ search });
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
            start_date: ch.start_date?.split(' ')[0] || '',
            end_date: ch.end_date?.split(' ')[0] || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ title: '', description: '', emoji: '', points: '', start_date: '', end_date: '' });
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Challenges Management</h2>
                <div className="flex gap-3">
                    <input type="text" placeholder="Search challenges..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    <button onClick={() => { setEditing(null); setForm({ title: '', description: '', emoji: '', points: '', start_date: '', end_date: '' }); setShowModal(true); }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        + Add Challenge
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {challenges.map(ch => (
                    <div key={ch.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{ch.emoji || '⚡'}</span>
                                <h3 className="font-semibold text-gray-800 text-lg">{ch.title}</h3>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => openEdit(ch)} className="text-purple-600 hover:text-purple-700 text-sm">Edit</button>
                                <button onClick={() => handleDelete(ch.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                            </div>
                        </div>
                        {ch.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{ch.description}</p>}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                            <span>⭐ {ch.points} pts</span>
                            <span>📅 {new Date(ch.start_date).toLocaleDateString()} - {new Date(ch.end_date).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ch.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {ch.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {challenges.length === 0 && (
                <div className="text-center py-8 text-gray-500">No challenges found</div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editing ? 'Edit Challenge' : 'Create Challenge'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                                    <div className="grid grid-cols-6 gap-1.5">
                                        {EMOJI_OPTIONS.map(e => (
                                            <button key={e} type="button" onClick={() => setForm({ ...form, emoji: e })}
                                                className={`w-9 h-9 flex items-center justify-center text-lg rounded-lg border transition-all ${
                                                    form.emoji === e ? 'border-purple-500 bg-purple-100 scale-110' : 'border-gray-200 hover:border-gray-300'
                                                }`}>{e}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                        <input type="number" min="1" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                                        <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400">
                                            <option>Yes</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    {editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
