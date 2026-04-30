import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/api';
import StatusBar from '../components/StatusBar';

const POST_TYPES = [
    { type: 'text', label: 'Text', icon: '📝', color: 'purple' },
    { type: 'image', label: 'Photo', icon: '📷', color: 'green' },
    { type: 'video', label: 'Video', icon: '🎬', color: 'blue' },
    { type: 'reel', label: 'Reel', icon: '🎥', color: 'orange' },
    { type: 'live', label: 'Live', icon: '🔴', color: 'red' },
];

const REACTIONS = [
    { emoji: 'like', emojiColor: '👍', label: 'Like', activeClass: 'text-blue-500' },
    { emoji: 'fire', emojiColor: '🔥', label: 'Fire', activeClass: 'text-orange-500' },
    { emoji: 'love', emojiColor: '💖', label: 'Love', activeClass: 'text-pink-500' },
    { emoji: 'pray', emojiColor: '🙏', label: 'Pray', activeClass: 'text-purple-500' },
    { emoji: 'wow', emojiColor: '😮', label: 'Wow', activeClass: 'text-yellow-500' },
];

function ReactionButton({ post, userReacted, onReact }) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReact = (reactionType) => {
        setShowPicker(false);
        onReact(reactionType);
    };

    const totalReactions = post.reactions_count || 0;
    const reactions = post.reactions || {};
    
    const myReaction = REACTIONS.find(r => r.emojiColor === userReacted);
    
    const showEmoji = myReaction ? myReaction.emojiColor : '🔥';
    const showColor = myReaction ? myReaction.activeClass : 'text-gray-500';
    const isActive = !!myReaction;

    const emojiSummary = Object.entries(reactions)
        .sort((a, b) => b[1] - a[1])
        .map(([emoji, count]) => {
            const reaction = REACTIONS.find(r => r.emojiColor === emoji);
            const fallbackReaction = REACTIONS.find(r => r.emoji === emoji);
            return { 
                emoji: reaction?.emojiColor || fallbackReaction?.emojiColor || emoji, 
                count, 
                label: reaction?.label || fallbackReaction?.label || 'Reaction' 
            };
        });

    return (
        <div className="relative" ref={pickerRef}>
            <button
                onClick={() => setShowPicker(!showPicker)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                    isActive 
                        ? `${showColor} bg-pink-50` 
                        : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
                }`}
            >
                <span className="text-xl">{showEmoji}</span>
                {totalReactions > 0 && (
                    <span className="font-medium text-sm">{totalReactions}</span>
                )}
            </button>

            {showPicker && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 min-w-[220px]">
                    {emojiSummary.length > 0 && (
                        <div className="mb-3 pb-2 border-b border-gray-100">
                            <p className="text-xs text-gray-500 mb-1.5">Reactions:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {emojiSummary.map(({ emoji, count }) => (
                                    <span key={emoji} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                                        <span>{emoji}</span>
                                        <span className="text-gray-600 font-medium">{count}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {myReaction && (
                        <p className="text-xs text-gray-500 mb-2">
                            You reacted with <span className="font-medium">{myReaction.emojiColor} {myReaction.label}</span>
                        </p>
                    )}
                    
                    <p className="text-xs text-gray-500 mb-2">React with:</p>
                    <div className="flex gap-2 justify-center">
                        {REACTIONS.map((r) => {
                            const isSelected = userReacted && r.emojiColor === userReacted;
                            return (
                                <button
                                    key={r.emoji}
                                    onClick={() => handleReact(r.emoji)}
                                    className={`text-2xl hover:scale-125 transition-transform p-2 rounded-full hover:bg-gray-100 ${
                                        isSelected ? 'bg-pink-100 ring-4 ring-pink-400 scale-110' : ''
                                    }`}
                                    title={r.label}
                                >
                                    {r.emojiColor}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function UserAvatar({ user }) {
    if (user?.avatar) {
        return (
            <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src={`/storage/${user.avatar}`} alt="" className="w-full h-full object-cover" />
            </div>
        );
    }
    return (
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
    );
}

function PostTypeTag({ type }) {
    const config = POST_TYPES.find(p => p.type === type) || POST_TYPES[0];
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full bg-${config.color}-100 text-${config.color}-700`}>
            {config.icon} {config.label}
        </span>
    );
}

function PostTypeSelector({ selected, onSelect }) {
    return (
        <div className="flex gap-2 flex-wrap">
            {POST_TYPES.map(pt => (
                <button
                    key={pt.type}
                    onClick={() => onSelect(pt.type)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        selected === pt.type 
                            ? `bg-${pt.color}-100 text-${pt.color}-700 ring-2 ring-${pt.color}-400` 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {pt.icon} {pt.label}
                </button>
            ))}
        </div>
    );
}

function MediaPreview({ file, postType }) {
    if (!file) return null;
    
    const url = URL.createObjectURL(file);
    
    if (postType === 'image') {
        return (
            <div className="relative mt-2">
                <img src={url} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                <button
                    onClick={() => {}}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                    ×
                </button>
            </div>
        );
    }
    
    return (
        <div className="relative mt-2">
            <video src={url} className="max-h-48 rounded-lg" controls />
            <button
                onClick={() => {}}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
            >
                ×
            </button>
        </div>
    );
}

export default function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [postType, setPostType] = useState('text');
    const [mediaFile, setMediaFile] = useState(null);
    const [posting, setPosting] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [showMenu, setShowMenu] = useState(null);
    const [showComments, setShowComments] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [sharePost, setSharePost] = useState(null);
    const [shareType, setShareType] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [verseOfDay, setVerseOfDay] = useState(null);
    const [challengeOfDay, setChallengeOfDay] = useState(null);
    const [birthdayUsers, setBirthdayUsers] = useState([]);
    const [announcement, setAnnouncement] = useState(null);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);
    const shareRef = useRef(null);

    useEffect(() => {
        loadPosts();
        loadDailyContent();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(null);
            }
            if (shareRef.current && !shareRef.current.contains(e.target)) {
                setSharePost(null);
                setShareType(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReshare = (post, type) => {
        setSharePost(post);
        setShareType(type);
    };

    const confirmReshare = (type) => {
        const post = sharePost;
        setSharePost(null);
        setShareType(null);
        
        if (type === 'feed') {
            setPosts([{
                ...post,
                id: Date.now(),
                content: `Shared: ${post.content}`,
                user: user,
                shares_count: 0,
                reactions_count: 0,
                comments: []
            }, ...posts]);
            alert('Shared to your feed!');
        } else if (type === 'status') {
            alert('Shared to your status!');
        }
    };

    const handleShare = (platform) => {
        const url = `${window.location.origin}/post/${sharePost?.id}`;
        
        switch(platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'snapchat':
                window.open(`https://www.snapchat.com/snap/${encodeURIComponent(url)}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                alert('Link copied to clipboard!');
                break;
        }
        setSharePost(null);
    };

    const loadPosts = async () => {
        try {
            const res = await postService.getPosts();
            const posts = Array.isArray(res.data) ? res.data : res.data.data || [];
            setPosts(posts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadDailyContent = async () => {
        try {
            const [devotionalRes, challengeRes, usersRes, announcementRes] = await Promise.all([
                axios.get('/api/devotionals/today'),
                axios.get('/api/challenges'),
                axios.get('/api/users/birthdays'),
                axios.get('/api/announcements/active')
            ]);
            setVerseOfDay(devotionalRes.data);
            const today = new Date().toISOString().split('T')[0];
            const todayChallenge = challengeRes.data.find(c => c.start_date <= today && c.end_date >= today);
            setChallengeOfDay(todayChallenge || challengeRes.data[0] || null);
            setBirthdayUsers(usersRes.data || []);
            setAnnouncement(announcementRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        
        const needsMedia = ['image', 'video', 'reel'].includes(postType) && !mediaFile;
        if (needsMedia) {
            alert(`Please select a ${postType} to upload`);
            return;
        }

        setPosting(true);
        try {
            const formData = new FormData();
            formData.append('content', newPost);
            formData.append('post_type', postType);
            if (mediaFile) {
                formData.append('media', mediaFile);
            }
            
            const res = await postService.createPost(formData);
            setPosts([res.data, ...posts]);
            setNewPost('');
            setMediaFile(null);
            setPostType('text');
            setShowTypeSelector(false);
        } catch (err) {
            console.error(err);
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (postId, reactionType = 'fire') => {
        try {
            await postService.likePost(postId, reactionType);
            const res = await postService.getPosts();
            const allPosts = Array.isArray(res.data) ? res.data : res.data.data || [];
            setPosts(allPosts);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmitComment = async (postId, parentId = null) => {
        const text = parentId ? replyText : commentText;
        if (!text.trim()) return;
        setSubmittingComment(true);
        try {
            const res = await postService.commentPost(postId, text, parentId);
            setPosts(posts.map(p => {
                if (p.id === postId) {
                    if (parentId && parentId.toString().startsWith('reply-')) {
                        const originalParentId = parseInt(parentId.replace('reply-', ''));
                        const updatedComments = p.comments.map(c => {
                            if (c.id === originalParentId) {
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), res.data]
                                };
                            }
                            return c;
                        });
                        return { ...p, comments: updatedComments };
                    } else if (parentId) {
                        const updatedComments = p.comments.map(c => {
                            if (c.id === parentId) {
                                return {
                                    ...c,
                                    replies: [...(c.replies || []), res.data]
                                };
                            }
                            return c;
                        });
                        return { ...p, comments: updatedComments };
                    }
                    return {
                        ...p,
                        comments: [...(p.comments || []), res.data]
                    };
                }
                return p;
            }));
            setReplyText('');
            setReplyingTo(null);
            setCommentText('');
        } catch (err) {
            console.error(err);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setEditContent(post.content);
        setShowMenu(null);
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        try {
            await postService.updatePost(editingPost.id, { content: editContent });
            setPosts(posts.map(p => p.id === editingPost.id ? { ...p, content: editContent } : p));
            setEditingPost(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await postService.deletePost(postId);
            setPosts(posts.filter(p => p.id !== postId));
            setShowMenu(null);
        } catch (err) {
            console.error(err);
            alert('Failed to delete post');
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
        }
    };

    const needsMedia = ['image', 'video', 'reel'].includes(postType);

    return (
        <div className="space-y-6">
            <StatusBar />

            {birthdayUsers.length > 0 && (
                <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-4 shadow-lg text-white animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl">🎂</div>
                        <div>
                            <p className="font-bold text-lg">
                                Happy Birthday{birthdayUsers.length > 1 ? 's' : ''}!
                            </p>
                            <p className="text-pink-100 text-sm">
                                {birthdayUsers.map(u => u.name).join(', ')} {birthdayUsers.length > 1 ? 'are' : 'is'} celebrating today! 🎉
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Feed - Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 shadow-lg shadow-purple-100 border border-purple-100">
                        <form onSubmit={handlePost}>
                            <div className="flex gap-3">
                                <UserAvatar user={user} />
                                <div className="flex-1">
                                    <textarea 
                                        value={newPost} 
                                        onChange={(e) => setNewPost(e.target.value)} 
                                        placeholder="What's on your heart? Share your faith journey..."
                                        className="w-full p-3 bg-white border border-purple-100 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm" 
                                        rows={3} 
                                    />
                                    
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowTypeSelector(!showTypeSelector)}
                                            className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                        >
                                            <span>➕</span>
                                            <span>{showTypeSelector ? 'Hide options' : 'Add media'}</span>
                                        </button>
                                        
                                        {showTypeSelector && (
                                            <div className="mt-3 p-3 bg-white rounded-xl border border-purple-100">
                                                <p className="text-xs text-gray-500 mb-2">Select post type:</p>
                                                <PostTypeSelector selected={postType} onSelect={setPostType} />
                                                
                                                {needsMedia && (
                                                    <div className="mt-3">
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleMediaChange}
                                                            accept={postType === 'image' ? 'image/*' : 'video/*'}
                                                            className="hidden"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                        >
                                                            <span>📎</span>
                                                            <span>{mediaFile ? mediaFile.name : `Select ${postType}`}</span>
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {mediaFile && (
                                                    <MediaPreview file={mediaFile} postType={postType} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex justify-between items-center mt-3">
                                        <PostTypeTag type={postType} />
                                        <button 
                                            type="submit" 
                                            disabled={posting || !newPost.trim() || (needsMedia && !mediaFile)}
                                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {posting ? '⏳ Posting...' : '✨ Share'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-gray-500 mt-3">Loading posts...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                            <div className="text-6xl mb-4">✨</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
                            <p className="text-gray-500">Be the first to share your faith journey!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="bg-white rounded-2xl p-5 shadow-lg shadow-purple-100 border border-purple-50 hover:shadow-xl transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <UserAvatar user={post.user} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/profile/${post.user?.id}`} className="font-semibold text-gray-800 hover:text-purple-600 transition-colors">
                                                {post.user?.name || 'User'}
                                            </Link>
                                            <PostTypeTag type={post.post_type || 'text'} />
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center gap-2">
                                            {new Date(post.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {user?.id === post.user?.id && (
                                        <div className="relative" ref={menuRef}>
                                            <button
                                                onClick={() => setShowMenu(showMenu === post.id ? null : post.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <span className="text-gray-500">⋮</span>
                                            </button>
                                            {showMenu === post.id && (
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 min-w-[120px]">
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <span>✏️</span> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                                                    >
                                                        <span>🗑️</span> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-gray-700 mb-4 text-lg leading-relaxed">{post.content}</p>
                                
                                {post.media_url && (
                                    post.media_type === 'video' ? (
                                        <video 
                                            src={`/storage/${post.media_url}`} 
                                            controls 
                                            className="rounded-xl mb-4 max-h-80 w-full object-cover shadow-md"
                                        />
                                    ) : (
                                        <img 
                                            src={`/storage/${post.media_url}`} 
                                            alt="" 
                                            className="rounded-xl mb-4 max-h-80 w-full object-cover shadow-md" 
                                        />
                                    )
                                )}
                                
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <ReactionButton 
                                        post={post} 
                                        userReacted={post.user_reacted}
                                        onReact={(emoji) => handleLike(post.id, emoji)}
                                    />
                                    <button 
                                        onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                                            showComments === post.id 
                                                ? 'text-purple-500 bg-purple-50' 
                                                : 'text-gray-500 hover:text-purple-500 hover:bg-purple-50'
                                        }`}
                                    >
                                        <span className="text-xl">💬</span>
                                        <span className="font-medium text-sm">{post.comments?.length || 0}</span>
                                    </button>
                                    <div className="relative" ref={shareRef}>
                                        <button 
                                            onClick={() => handleReshare(post, 'reshare')}
                                            className="flex items-center gap-2 text-gray-500 hover:text-green-500 hover:bg-green-50 px-3 py-2 rounded-xl transition-all"
                                        >
                                            <span className="text-xl">🔁</span>
                                            <span className="font-medium text-sm">{post.shares_count || 0}</span>
                                        </button>
                                        {sharePost?.id === post.id && shareType === 'reshare' && (
                                            <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[180px]">
                                                <button
                                                    onClick={() => confirmReshare('feed')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>📝</span> Share to Feed
                                                </button>
                                                <button
                                                    onClick={() => confirmReshare('status')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>📱</span> Share to Status
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <button 
                                            onClick={() => handleReshare(post, 'share')}
                                            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all"
                                        >
                                            <span className="text-xl">📤</span>
                                        </button>
                                        {sharePost?.id === post.id && shareType === 'share' && (
                                            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[180px]">
                                                <button
                                                    onClick={() => handleShare('facebook')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>📘</span> Facebook
                                                </button>
                                                <button
                                                    onClick={() => handleShare('whatsapp')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>💬</span> WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => handleShare('twitter')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>🐦</span> Twitter
                                                </button>
                                                <button
                                                    onClick={() => handleShare('snapchat')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>👻</span> Snapchat
                                                </button>
                                                <button
                                                    onClick={() => handleShare('copy')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <span>🔗</span> Copy Link
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {showComments === post.id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Write a comment..."
                                                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                                                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                                            />
                                            <button
                                                onClick={() => handleSubmitComment(post.id)}
                                                disabled={submittingComment || !commentText.trim()}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                Post
                                            </button>
                                        </div>

                                        {post.comments?.map(comment => (
                                            <div key={comment.id} className="space-y-3">
                                                <div className="flex gap-2">
                                                    <UserAvatar user={comment.user} />
                                                    <div className="flex-1 bg-gray-50 rounded-xl p-3">
                                                        <p className="font-medium text-sm text-gray-800">{comment.user?.name}</p>
                                                        <p className="text-gray-700 text-sm">{comment.comment}</p>
                                                        <div className="flex gap-3 mt-2">
                                                            <button 
                                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                                className="text-xs text-purple-600 hover:text-purple-800"
                                                            >
                                                                Reply
                                                            </button>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {replyingTo === comment.id && (
                                                    <div className="flex gap-2 ml-8">
                                                        <input
                                                            type="text"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder={`Reply to ${comment.user?.name}...`}
                                                            className="flex-1 p-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-purple-500"
                                                            onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment(post.id, `reply-${comment.id}`)}
                                                        />
                                                        <button
                                                            onClick={() => handleSubmitComment(post.id, `reply-${comment.id}`)}
                                                            className="px-2 py-1 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700"
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                )}

                                                {comment.replies?.map(reply => (
                                                    <div key={reply.id} className="flex gap-2 ml-8">
                                                        <UserAvatar user={reply.user} />
                                                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                                                            <p className="font-medium text-sm text-gray-800">{reply.user?.name}</p>
                                                            <p className="text-gray-700 text-sm">{reply.comment}</p>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                        {(!post.comments || post.comments.length === 0) && (
                                            <p className="text-center text-gray-400 text-sm">No comments yet. Be the first!</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-4 h-full">
                    <div className="sticky top-24 space-y-4">
                        {announcement ? (
                            <div className={`rounded-2xl p-4 shadow-lg text-white ${
                                announcement.type === 'danger' ? 'bg-gradient-to-br from-red-500 to-rose-600' :
                                announcement.type === 'warning' ? 'bg-gradient-to-br from-amber-500 to-yellow-600' :
                                announcement.type === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                'bg-gradient-to-br from-blue-500 to-indigo-600'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📢</span>
                                    <span className="text-xs font-medium text-white/80">Announcement</span>
                                </div>
                                <h3 className="text-base font-bold mb-2">{announcement.title}</h3>
                                <p className="text-sm text-white/90">{announcement.content}</p>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-4 shadow-lg text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📢</span>
                                    <span className="text-xs font-medium text-white/80">Announcement</span>
                                </div>
                                <p className="text-sm text-white/80 italic">No announcement</p>
                            </div>
                        )}

                        {verseOfDay && (
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-4 shadow-lg text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">📖</span>
                                    <span className="text-xs font-medium text-indigo-200">Verse of the Day</span>
                                </div>
                                <p className="text-sm italic leading-relaxed mb-2 line-clamp-4">"{verseOfDay.content?.split('\n\n')[0]}"</p>
                                <p className="text-indigo-200 text-xs font-medium">— {verseOfDay.verse}</p>
                            </div>
                        )}

                        {challengeOfDay && (
                            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{challengeOfDay.emoji}</span>
                                    <span className="text-xs font-medium text-amber-100">Challenge of the Day</span>
                                </div>
                                <h3 className="text-base font-bold mb-1">{challengeOfDay.title}</h3>
                                <p className="text-amber-100 text-xs mb-3 line-clamp-2">{challengeOfDay.description}</p>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full">⭐ {challengeOfDay.points}</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full">{new Date(challengeOfDay.end_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}

                        {birthdayUsers.length > 0 && (
                            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 shadow-lg text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🎂</span>
                                    <span className="text-xs font-medium text-pink-100">Birthday Today!</span>
                                </div>
                                <div className="space-y-2">
                                    {birthdayUsers.map(u => (
                                        <div key={u.id} className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">{u.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {editingPost && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditingPost(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Edit Post</h3>
                        <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setEditingPost(null)}
                                className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
