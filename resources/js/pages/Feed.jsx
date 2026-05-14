import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { postService, statusService, userService } from '../services/api';
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
    const [statusRefreshKey, setStatusRefreshKey] = useState(0);
    const [showWishModal, setShowWishModal] = useState(false);
    const [wishMessage, setWishMessage] = useState('');
    const [wishingTo, setWishingTo] = useState(null);
    const [sendingWish, setSendingWish] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [receivedWishes, setReceivedWishes] = useState([]);
    const [showWishes, setShowWishes] = useState(false);
    const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
    const fileInputRef = useRef(null);
    const menuRef = useRef(null);

    const renderPostContent = (post) => {
        if (post.shared_from_post_id && post.shared_from) {
            return (
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                        <span>Shared from</span>
                        <UserAvatar user={post.shared_from.user} />
                        <Link to={`/profile/${post.shared_from.user?.id}`} className="font-semibold text-sm text-gray-800 hover:text-purple-600 transition-colors">
                            {post.shared_from.user?.name || 'User'}
                        </Link>
                    </div>
                    <div className="ml-12 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-700 text-sm mb-2">{post.shared_from.content}</p>
                        {post.shared_from.media_url && (
                            post.shared_from.media_type === 'video' ? (
                                <video 
                                    src={`/storage/${post.shared_from.media_url}`} 
                                    controls 
                                    className="rounded-lg max-h-48 w-full object-cover"
                                />
                            ) : (
                                <img 
                                    src={`/storage/${post.shared_from.media_url}`} 
                                    alt="" 
                                    className="rounded-lg max-h-48 w-full object-cover" 
                                />
                            )
                        )}
                    </div>
                </div>
            );
        }
        return (
            <>
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
            </>
        );
    };
    
    useEffect(() => {
        loadPosts();
        loadDailyContent();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(null);
            }
            if (!e.target.closest('.share-container')) {
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

    const confirmReshare = async (type) => {
        const post = sharePost;
        setSharePost(null);
        setShareType(null);

        if (!post) {
            alert('No post selected');
            return;
        }

        try {
            if (type === 'feed') {
                const res = await postService.sharePost(post.id);
                setPosts(prev => [res.data, ...prev.map(p => p.id === post.id ? { ...p, shares_count: (p.shares_count || 0) + 1 } : p)]);
            } else if (type === 'status') {
                await statusService.sharePost(post.id);
                setPosts(prev => prev.map(p => p.id === post.id ? { ...p, shares_count: (p.shares_count || 0) + 1 } : p));
                setStatusRefreshKey(k => k + 1);
            }
        } catch (err) {
            alert('Reshare failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleShare = (platform) => {
        const post = sharePost;
        const url = `${window.location.origin}/post/${post?.id}`;
        const text = post?.content ? post.content.slice(0, 100) : 'Check this out on YouthFaith';
        
        switch(platform) {
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                break;
            case 'twitter':
                window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank', 'noopener,noreferrer');
                break;
            case 'snapchat':
                navigator.clipboard.writeText(url);
                alert('Link copied! Open Snapchat to share it with your friends.');
                break;
            case 'tiktok':
                navigator.clipboard.writeText(text + ' ' + url);
                alert('Link copied! Paste it into TikTok to share.');
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

    const loadMyWishes = async () => {
        try {
            const res = await userService.getBirthdayWishes();
            setReceivedWishes(res.data || []);
        } catch {}
    };

    const handleSendWish = async () => {
        if (!wishMessage.trim() || !wishingTo) return;
        setSendingWish(true);
        try {
            await userService.sendBirthdayWish(wishingTo.id, wishMessage);
            setWishMessage('');
            setShowWishModal(false);
            setWishingTo(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send wish');
        } finally {
            setSendingWish(false);
        }
    };

    const loadDailyContent = async () => {
        try {
            const [devotionalRes, challengeRes, usersRes, announcementRes, upcomingRes] = await Promise.all([
                axios.get('/api/devotionals/today'),
                axios.get('/api/challenges'),
                axios.get('/api/users/birthdays'),
                axios.get('/api/announcements/active'),
                axios.get('/api/users/birthdays/upcoming'),
            ]);
            setVerseOfDay(devotionalRes.data);
            const today = new Date().toISOString().split('T')[0];
            const todayChallenge = challengeRes.data.find(c => c.start_date <= today && c.end_date >= today);
            setChallengeOfDay(todayChallenge || challengeRes.data[0] || null);
            const birthdayPeople = usersRes.data || [];
            setBirthdayUsers(birthdayPeople);
            setUpcomingBirthdays(upcomingRes.data || []);
            setAnnouncement(announcementRes.data);

            if (user && birthdayPeople.some(u => u.id === user.id)) {
                setShowCelebration(true);
                loadMyWishes();
            }
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
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions_count: (p.reactions_count || 0) + 1 } : p));
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
            <StatusBar key={statusRefreshKey} />

            {birthdayUsers.length > 0 && (
                <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-4 sm:p-5 shadow-lg text-white">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-3xl sm:text-5xl animate-bounce shrink-0">🎂</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg sm:text-xl">
                                Happy Birthday{birthdayUsers.length > 1 ? 's' : ''}! 🎉
                            </p>
                            <p className="text-pink-100 text-sm mt-1">
                                {birthdayUsers.map(u => u.firstname || u.name).join(', ')} {birthdayUsers.length > 1 ? 'are' : 'is'} celebrating today!
                            </p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {birthdayUsers.filter(u => !user || u.id !== user.id).map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => { setWishingTo(u); setShowWishModal(true); }}
                                        className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-all flex items-center gap-1.5"
                                    >
                                        🎁 Wish {u.firstname || u.name}
                                    </button>
                                ))}
                                {birthdayUsers.some(u => user && u.id === user.id) && (
                                    <button
                                        onClick={() => setShowWishes(!showWishes)}
                                        className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-sm font-medium transition-all flex items-center gap-1.5"
                                    >
                                        💌 {showWishes ? 'Hide' : 'View'} Wishes ({receivedWishes.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {showWishes && receivedWishes.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/20 space-y-2 max-h-60 overflow-y-auto">
                            {receivedWishes.map(w => (
                                <div key={w.id} className="bg-white/10 rounded-xl p-3 flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm shrink-0">
                                        {w.from_user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{w.from_user?.name}</p>
                                        <p className="text-sm text-pink-100">{w.message}</p>
                                        <p className="text-xs text-pink-200 mt-0.5">{new Date(w.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                                
                                {renderPostContent(post)}
                                
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
                                    <div className="relative share-container">
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
                                    <div className="relative share-container">
                                        <button 
                                            onClick={() => handleReshare(post, 'share')}
                                            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 px-3 py-2 rounded-xl transition-all"
                                        >
                                            <span className="text-xl">📤</span>
                                        </button>
                                        {sharePost?.id === post.id && shareType === 'share' && (
                                            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[200px]">
                                                <p className="px-4 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide">Share link to</p>
                                                <button
                                                    onClick={() => handleShare('facebook')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                                    Facebook
                                                </button>
                                                <button
                                                    onClick={() => handleShare('twitter')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                                    X (Twitter)
                                                </button>
                                                <button
                                                    onClick={() => handleShare('whatsapp')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                    WhatsApp
                                                </button>
                                                <button
                                                    onClick={() => handleShare('snapchat')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <img src="/images/snapchat-logo.svg" alt="Snapchat" className="w-5 h-5 shrink-0" />
                                                    Snapchat
                                                </button>
                                                <button
                                                    onClick={() => handleShare('tiktok')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#000000"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                                                    TikTok
                                                </button>
                                                <button
                                                    onClick={() => handleShare('copy')}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#6B7280"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                                                    Copy Link
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
                        {upcomingBirthdays.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 shadow-lg text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🎈</span>
                                    <span className="text-xs font-medium text-purple-100">Upcoming Birthdays</span>
                                </div>
                                <div className="space-y-2">
                                    {upcomingBirthdays.map(u => (
                                        <div key={u.id} className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium block truncate">{u.firstname || u.name}</span>
                                            </div>
                                            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full shrink-0">{u.in_days}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showCelebration && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-600/60 via-purple-600/60 to-rose-600/60 backdrop-blur-sm" onClick={() => setShowCelebration(false)} />
                    <div className="relative bg-white rounded-3xl p-5 sm:p-8 w-full max-w-sm text-center shadow-2xl animate-in overflow-hidden">
                        <div className="text-5xl sm:text-7xl mb-4 animate-bounce">🎉</div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">Happy Birthday!</h2>
                        <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent mb-2">
                            {user?.firstname || user?.name}
                        </p>
                        <p className="text-gray-500 mb-6">May God bless you abundantly today and always! 🙏</p>
                        {receivedWishes.length > 0 && (
                            <div className="mb-6 p-4 bg-pink-50 rounded-2xl text-left max-h-40 overflow-y-auto">
                                <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-3">
                                    💌 Birthday Wishes ({receivedWishes.length})
                                </p>
                                <div className="space-y-3">
                                    {receivedWishes.map(w => (
                                        <div key={w.id} className="flex items-start gap-2">
                                            <div className="w-7 h-7 rounded-full bg-pink-200 flex items-center justify-center text-pink-700 text-xs font-bold shrink-0">
                                                {w.from_user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-700">{w.from_user?.name}</p>
                                                <p className="text-sm text-gray-600">{w.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-3">
                            {receivedWishes.length > 0 && (
                                <button
                                    onClick={() => { setShowCelebration(false); setShowWishes(true); }}
                                    className="flex-1 py-3 border border-pink-200 text-pink-600 rounded-xl font-medium hover:bg-pink-50 transition-all"
                                >
                                    View All Wishes
                                </button>
                            )}
                            <button
                                onClick={() => setShowCelebration(false)}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                Let's Go! 🚀
                            </button>
                        </div>
                        <div className="absolute -top-4 -right-4 text-4xl animate-ping">🎈</div>
                        <div className="absolute -bottom-2 -left-2 text-3xl animate-ping" style={{ animationDelay: '0.5s' }}>🎊</div>
                    </div>
                </div>
            )}

            {showWishModal && wishingTo && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowWishModal(false); setWishingTo(null); }}>
                    <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="text-3xl">🎂</div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Send Birthday Wish</h3>
                                <p className="text-sm text-gray-500">to {wishingTo.firstname || wishingTo.name}</p>
                            </div>
                        </div>
                        <textarea
                            value={wishMessage}
                            onChange={e => setWishMessage(e.target.value)}
                            placeholder={`Write a birthday message for ${wishingTo.firstname || wishingTo.name}...`}
                            className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-pink-500"
                            rows={4}
                            maxLength={500}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400">{wishMessage.length}/500</span>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => { setShowWishModal(false); setWishingTo(null); }}
                                className="flex-1 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendWish}
                                disabled={sendingWish || !wishMessage.trim()}
                                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 text-sm"
                            >
                                {sendingWish ? 'Sending...' : '🎁 Send Wish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
