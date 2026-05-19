import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import AdminPanel from './AdminPanel';

const POST_TYPE_STYLES = {
    text: { bg: 'bg-gray-100', text: 'text-gray-600', icon: '📝' },
    image: { bg: 'bg-blue-100', text: 'text-blue-600', icon: '🖼️' },
    video: { bg: 'bg-purple-100', text: 'text-purple-600', icon: '🎬' },
    reel: { bg: 'bg-pink-100', text: 'text-pink-600', icon: '🎞️' },
    live: { bg: 'bg-red-100', text: 'text-red-600', icon: '🔴' },
};

function timeAgo(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

function getAvatarSrc(user) {
    if (!user) return null;
    if (user.avatar?.startsWith('http')) return user.avatar;
    if (user.avatar) return `/storage/${user.avatar}`;
    return null;
}

export default function PostsPanel() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [previewMedia, setPreviewMedia] = useState(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        loadPosts();
    }, [page, search, dateFrom, dateTo]);

    const hasDateFilter = dateFrom || dateTo;

    const clearDates = () => {
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const loadPosts = async () => {
        try {
            const params = { page, search };
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            const res = await adminService.getPosts(params);
            setPosts(res.data.data || res.data);
            setPagination(res.data);
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
        return (
            <AdminPanel title="Posts Management">
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 bg-gray-100 rounded w-32" />
                                    <div className="h-2.5 bg-gray-100 rounded w-20" />
                                </div>
                                <div className="h-8 w-16 bg-gray-100 rounded-xl" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="h-3 bg-gray-100 rounded w-full" />
                                <div className="h-3 bg-gray-100 rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </AdminPanel>
        );
    }

    return (
        <AdminPanel
            title={`Posts (${pagination?.total || posts.length})`}
            search={search}
            onSearch={(e) => { setSearch(e.target.value); setPage(1); }}
            searchPlaceholder="Search posts..."
        >
            <div className="flex flex-wrap items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">From</label>
                    <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">To</label>
                    <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                {hasDateFilter && (
                    <button onClick={clearDates} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                        ✕ Clear dates
                    </button>
                )}
            </div>

            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-2xl mb-4">
                        📝
                    </div>
                    <p className="text-gray-500 font-medium">No posts found</p>
                    <p className="text-gray-400 text-sm mt-1">{hasDateFilter || search ? 'Try adjusting your filters' : 'No posts have been created yet'}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post, i) => {
                        const typeStyle = POST_TYPE_STYLES[post.post_type] || POST_TYPE_STYLES.text;
                        const avatarSrc = getAvatarSrc(post.user);
                        const hasMedia = post.media_url;
                        const isVideo = post.media_type === 'video' || post.post_type === 'video' || post.post_type === 'reel';

                        return (
                            <div key={post.id} className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                                <div className="p-4 sm:p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {avatarSrc ? (
                                                <img src={avatarSrc} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                                                    {post.user?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900 text-sm truncate">{post.user?.name || 'Unknown'}</span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${typeStyle.bg} ${typeStyle.text}`}>
                                                        {typeStyle.icon} {post.post_type || 'text'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                                    <span>{timeAgo(post.created_at)}</span>
                                                    {post.location && (
                                                        <>
                                                            <span>·</span>
                                                            <span>📍 {post.location}</span>
                                                        </>
                                                    )}
                                                    {post.shares_count > 0 && (
                                                        <>
                                                            <span>·</span>
                                                            <span>🔄 {post.shares_count}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 hover:text-red-700 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100"
                                        >
                                            Delete
                                        </button>
                                    </div>

                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                    {hasMedia && (
                                        <div className="mt-3 relative">
                                            {isVideo ? (
                                                <div className="relative rounded-xl overflow-hidden bg-gray-900 max-h-60">
                                                    <video
                                                        src={`/storage/${post.media_url}`}
                                                        className="w-full max-h-60 object-contain cursor-pointer"
                                                        controls
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
                                                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                            <span className="text-purple-600 text-lg ml-0.5">▶</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setPreviewMedia(previewMedia === `/storage/${post.media_url}` ? null : `/storage/${post.media_url}`)} className="w-full">
                                                    <img
                                                        src={`/storage/${post.media_url}`}
                                                        alt=""
                                                        className="w-full rounded-xl object-cover max-h-60 border border-gray-100"
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {pagination?.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                page === i + 1
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {previewMedia && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewMedia(null)}>
                    <img src={previewMedia} alt="" className="max-w-full max-h-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </AdminPanel>
    );
}