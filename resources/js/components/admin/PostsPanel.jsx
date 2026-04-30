import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function PostsPanel() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadPosts();
    }, [page, search]);

    const loadPosts = async () => {
        try {
            const res = await adminService.getPosts({ page, search });
            setPosts(res.data.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await adminService.deletePost(id);
            loadPosts();
        } catch (err) {
            alert('Failed to delete post');
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Posts Management</h2>
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            <div className="space-y-4">
                {posts.map(post => (
                    <div key={post.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                                        {post.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium text-gray-800">{post.user?.name}</span>
                                    <span className="text-gray-500 text-sm">• {new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700">{post.content}</p>
                                {post.media_url && (
                                    <img 
                                        src={`/storage/${post.media_url}`} 
                                        alt="" 
                                        className="mt-2 rounded-lg max-h-40 object-cover"
                                    />
                                )}
                            </div>
                            <button
                                onClick={() => handleDelete(post.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 shrink-0"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-8 text-gray-500">No posts found</div>
            )}
        </div>
    );
}