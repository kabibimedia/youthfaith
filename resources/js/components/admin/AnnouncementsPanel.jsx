import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminPanel from './AdminPanel';

const TYPE_COLORS = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
};

export default function AnnouncementsPanel() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', type: 'info', expires_at: '' });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            const res = await api.get('/admin/announcements');
            setAnnouncements(Array.isArray(res.data.data) ? res.data.data : Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/api/announcements/${editing.id}`, form);
            } else {
                await api.post('/api/announcements', form);
            }
            setShowForm(false);
            setEditing(null);
            setForm({ title: '', content: '', type: 'info', expires_at: '' });
            loadAnnouncements();
        } catch (err) {
            console.error(err);
            alert('Failed to save announcement');
        }
    };

    const handleEdit = (announcement) => {
        setEditing(announcement);
        setForm({
            title: announcement.title,
            content: announcement.content,
            type: announcement.type,
            expires_at: announcement.expires_at ? announcement.expires_at.split('T')[0] : '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            await api.delete(`/api/announcements/${id}`);
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActive = async (announcement) => {
        try {
            await api.put(`/api/announcements/${announcement.id}`, { is_active: !announcement.is_active });
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetFeatured = async (announcement) => {
        try {
            await api.post(`/api/announcements/${announcement.id}/featured`);
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <AdminPanel title="Announcements">
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
                </div>
            </AdminPanel>
        );
    }

    const featuredAnnouncement = announcements.find(a => a.is_featured);

    const actionBtn = (
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', content: '', type: 'info', expires_at: '' }); }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2">
            ➕ New Announcement
        </button>
    );

    return (
        <AdminPanel title={`Announcements (${announcements.length})`} action={actionBtn}>
            <div className="space-y-5">
                {featuredAnnouncement ? (
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm text-white/80 mb-1">Currently Displayed on Feed</p>
                                <h3 className="font-bold text-base sm:text-lg leading-tight">{featuredAnnouncement.title}</h3>
                                <p className="text-white/90 text-xs sm:text-sm mt-1 line-clamp-2">{featuredAnnouncement.content}</p>
                            </div>
                            <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                                <button onClick={() => handleEdit(featuredAnnouncement)}
                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm">Edit</button>
                                <button onClick={() => handleSetFeatured(featuredAnnouncement)}
                                    className="flex-1 sm:flex-none px-3 py-1.5 bg-white text-blue-600 hover:bg-white/90 rounded-lg text-xs sm:text-sm font-medium">Change</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-100 rounded-xl p-4 text-gray-500 text-center">
                        No announcement is currently displayed on the feed.
                        {announcements.length > 0 && (
                            <button onClick={() => handleSetFeatured(announcements[0])}
                                className="ml-2 text-purple-600 hover:text-purple-700 font-medium">Set one now</button>
                        )}
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'New'} Announcement</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" rows={4} required />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                        <option value="info">Info (Blue)</option>
                                        <option value="success">Success (Green)</option>
                                        <option value="warning">Warning (Amber)</option>
                                        <option value="danger">Danger (Red)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                                    <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 flex-col sm:flex-row">
                                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                                    {editing ? 'Update' : 'Create'}
                                </button>
                                <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                                    className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto -mx-5">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-3 sm:px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Type</th>
                                <th className="text-left py-3 px-3 sm:px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</th>
                                <th className="text-left py-3 px-3 sm:px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left py-3 px-3 sm:px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Expires</th>
                                <th className="text-right py-3 px-3 sm:px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-400">No announcements yet</td>
                                </tr>
                            ) : (
                                announcements.map((a) => (
                                    <tr key={a.id} className="border-b border-gray-50 hover:bg-purple-50/50 transition-colors">
                                        <td className="py-3 px-3 sm:px-5">
                                            <span className={`w-3 h-3 rounded-full inline-block ${TYPE_COLORS[a.type] || TYPE_COLORS.info}`}></span>
                                        </td>
                                        <td className="py-3 px-3 sm:px-5">
                                            <div className="font-medium text-gray-800 text-sm truncate max-w-[120px] sm:max-w-xs">{a.title}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-xs">{a.content}</div>
                                        </td>
                                        <td className="py-3 px-3 sm:px-5">
                                            <button onClick={() => handleToggleActive(a)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                                    a.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                                                }`}>{a.is_active ? 'Active' : 'Inactive'}</button>
                                            {a.is_featured && (
                                                <span className="ml-2 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium">⭐ Featured</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-3 sm:px-5 text-sm text-gray-400">
                                            {a.expires_at ? new Date(a.expires_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="py-3 px-3 sm:px-5 text-right whitespace-nowrap">
                                            {!a.is_featured && (
                                                <button onClick={() => handleSetFeatured(a)} className="text-yellow-600 hover:text-yellow-700 text-xs font-medium sm:mr-3" title="Set Featured">⭐</button>
                                            )}
                                            <button onClick={() => handleEdit(a)} className="text-purple-600 hover:text-purple-700 text-xs font-medium sm:mr-3 ml-1 sm:ml-0">Edit</button>
                                            <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-700 text-xs font-medium ml-1 sm:ml-0">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminPanel>
    );
}
