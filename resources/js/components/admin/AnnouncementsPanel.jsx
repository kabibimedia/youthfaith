import { useState, useEffect } from 'react';
import axios from 'axios';

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
            const res = await axios.get('/api/admin/announcements');
            setAnnouncements(res.data.data || res.data);
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
                await axios.put(`/api/announcements/${editing.id}`, form);
            } else {
                await axios.post('/api/announcements', form);
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
            await axios.delete(`/api/announcements/${id}`);
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActive = async (announcement) => {
        try {
            await axios.put(`/api/announcements/${announcement.id}`, { is_active: !announcement.is_active });
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSetFeatured = async (announcement) => {
        try {
            await axios.post(`/api/announcements/${announcement.id}/featured`);
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

    const featuredAnnouncement = announcements.find(a => a.is_featured);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Announcements</h2>
                <button
                    onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', content: '', type: 'info', expires_at: '' }); }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                >
                    <span>➕</span> New Announcement
                </button>
            </div>

            {featuredAnnouncement ? (
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/80 mb-1">Currently Displayed on Feed</p>
                            <h3 className="font-bold text-lg">{featuredAnnouncement.title}</h3>
                            <p className="text-white/90 text-sm mt-1 line-clamp-2">{featuredAnnouncement.content}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(featuredAnnouncement)}
                                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleSetFeatured(featuredAnnouncement)}
                                className="px-3 py-1.5 bg-white text-blue-600 hover:bg-white/90 rounded-lg text-sm font-medium"
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-100 rounded-xl p-4 text-gray-500 text-center">
                    No announcement is currently displayed on the feed.
                    {announcements.length > 0 && (
                        <button
                            onClick={() => handleSetFeatured(announcements[0])}
                            className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Set one now
                        </button>
                    )}
                </div>
            )}

            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'New'} Announcement</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                                rows={4}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="warning">Warning (Amber)</option>
                                    <option value="danger">Danger (Red)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                                <input
                                    type="date"
                                    value={form.expires_at}
                                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                {editing ? 'Update' : 'Create'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditing(null); }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Title</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Expires</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {announcements.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No announcements yet</td>
                            </tr>
                        ) : (
                            announcements.map((a) => (
                                <tr key={a.id}>
                                    <td className="px-4 py-3">
                                        <span className={`w-4 h-4 rounded-full inline-block ${TYPE_COLORS[a.type] || TYPE_COLORS.info}`}></span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-800">{a.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{a.content}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleToggleActive(a)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {a.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                        {a.is_featured && (
                                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⭐ Featured</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {a.expires_at ? new Date(a.expires_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {!a.is_featured && (
                                            <button onClick={() => handleSetFeatured(a)} className="text-yellow-600 hover:text-yellow-800 mr-3">⭐ Set Featured</button>
                                        )}
                                        <button onClick={() => handleEdit(a)} className="text-purple-600 hover:text-purple-800 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
