import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/api';

export default function Blogs() {
    const { user } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', excerpt: '', video_url: '', is_published: true });

    useEffect(() => { loadBlogs(); }, []);

    const loadBlogs = async () => {
        try {
            const res = await blogService.getBlogs();
            setBlogs(res.data.data || []);
        } catch {} finally { setLoading(false); }
    };

    const resetForm = () => {
        setForm({ title: '', content: '', excerpt: '', video_url: '', is_published: true });
        setEditing(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await blogService.updateBlog(editing.id, form);
            } else {
                await blogService.createBlog(form);
            }
            resetForm();
            loadBlogs();
            setSelected(null);
        } catch { alert('Failed to save blog'); }
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
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this blog post?')) return;
        try {
            await blogService.deleteBlog(id);
            loadBlogs();
            setSelected(null);
        } catch { alert('Failed to delete'); }
    };

    const getVideoId = (url) => {
        if (!url) return null;
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
    };

    const canEdit = (blog) => user && (user.is_admin || blog.user_id === user.id);

    if (loading) {
        return (
            <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
                <p className="text-gray-500 mt-3">Loading blogs...</p>
            </div>
        );
    }

    if (selected) {
        const videoId = getVideoId(selected.video_url);
        const canUserEdit = canEdit(selected);
        return (
            <div className="max-w-3xl mx-auto">
                <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-4">
                    ← Back to Blogs
                </button>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {selected.featured_image && (
                        <img src={selected.featured_image} alt={selected.title} className="w-full h-64 object-cover" />
                    )}
                    {videoId && (
                        <div className="aspect-video">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} title={selected.title} allowFullScreen />
                        </div>
                    )}
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{selected.title}</h1>
                                <p className="text-sm text-gray-400 mb-4">By {selected.author?.name} · {new Date(selected.published_at).toLocaleDateString()}</p>
                            </div>
                            {canUserEdit && (
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => openEdit(selected)} className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">Edit</button>
                                    <button onClick={() => handleDelete(selected.id)} className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                                </div>
                            )}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{selected.content}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">📝 Blogs & Vlogs</h1>
                    <p className="text-gray-500 mt-1">Read and share your faith journey</p>
                </div>
                {user && (
                    <button onClick={() => { setEditing(null); setForm({ title: '', content: '', excerpt: '', video_url: '', is_published: true }); setShowForm(true); }} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                        + Write Post
                    </button>
                )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {blogs.map(blog => {
                    const videoId = getVideoId(blog.video_url);
                    return (
                        <div key={blog.id} onClick={() => setSelected(blog)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group">
                            {blog.featured_image ? (
                                <img src={blog.featured_image} alt={blog.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : videoId ? (
                                <div className="w-full h-44 bg-gray-900 flex items-center justify-center">
                                    <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt={blog.title} className="w-full h-full object-cover opacity-80" />
                                    <span className="absolute text-4xl">▶️</span>
                                </div>
                            ) : (
                                <div className="w-full h-44 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl">📖</div>
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-2">{blog.title}</h3>
                                {blog.excerpt && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>}
                                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                                    <span>{blog.author?.name}</span>
                                    <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {blogs.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-5xl mb-4">📝</div>
                    <p className="text-gray-400">No blog posts yet</p>
                    {user && <p className="text-gray-300 text-sm mt-1">Be the first to share!</p>}
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
                            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Title"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required placeholder="Write your post..." rows={8}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 resize-none" />
                            <input type="text" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short excerpt (optional)"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="url" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="YouTube video URL (optional)"
                                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                                <div className="flex items-center gap-3 px-3 py-3 border border-gray-200 rounded-xl">
                                    <label className="text-sm text-gray-600">Publish:</label>
                                    <button type="button" onClick={() => setForm({ ...form, is_published: !form.is_published })}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-purple-600' : 'bg-gray-300'}`}>
                                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all">
                                {editing ? 'Update Post' : 'Publish Post'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
