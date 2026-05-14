import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function BlogsPanel() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', video_url: '', is_published: true });

    useEffect(() => { loadBlogs(); }, [search]);

    const loadBlogs = async () => {
        try {
            const res = await adminService.getBlogs({ search });
            setBlogs(res.data.data || res.data);
        } catch {} finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog post?')) return;
        try {
            await adminService.deleteBlog(id);
            loadBlogs();
        } catch { alert('Failed to delete'); }
    };

    const openEdit = (blog) => {
        setEditing(blog);
        setForm({
            title: blog.title,
            content: blog.content,
            excerpt: blog.excerpt || '',
            video_url: blog.video_url || '',
            is_published: blog.is_published,
        });
        setShowEdit(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateBlog(editing.id, form);
            setShowEdit(false);
            setEditing(null);
            loadBlogs();
        } catch { alert('Failed to update'); }
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Blogs Management</h2>
                <input type="text" placeholder="Search blogs..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="space-y-2">
                {blogs.length === 0 && <p className="text-center py-8 text-gray-400">No blogs found</p>}
                {blogs.map(blog => (
                    <div key={blog.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-sm">📝</div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">{blog.title}</div>
                                <div className="text-xs text-gray-400">By {blog.author?.name} · {new Date(blog.published_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => openEdit(blog)} className="text-purple-600 hover:text-purple-700 text-sm">Edit</button>
                            <button onClick={() => handleDelete(blog.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showEdit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEdit(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Blog</h3>
                        <form onSubmit={handleUpdate} className="space-y-3">
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="text" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Excerpt"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="YouTube URL"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600">Published:</label>
                                <button type="button" onClick={() => setForm({ ...form, is_published: !form.is_published })}
                                    className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => { setShowEdit(false); setEditing(null); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
