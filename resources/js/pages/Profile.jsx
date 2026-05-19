import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, postService } from '../services/api';

const TABS = [
    { key: 'posts', label: 'Posts', icon: '📝' },
    { key: 'photos', label: 'Photos', icon: '🖼️' },
    { key: 'tagged', label: 'Tagged', icon: '🏷️' },
    { key: 'events', label: 'Events', icon: '📅' },
    { key: 'about', label: 'About', icon: 'ℹ️' },
];

const avatarSrc = (path) => {
    if (!path) return '/default-avatar.png';
    if (path.startsWith('http') || path.startsWith('/storage/')) return path;
    return `/storage/${path}`;
};

const mediaSrc = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('/storage/')) return path;
    return `/storage/${path}`;
};

export default function Profile() {
    const { id } = useParams();
    const { user: currentUser, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [othername, setOthername] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [favoriteVerse, setFavoriteVerse] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [taggedPosts, setTaggedPosts] = useState([]);
    const [loadingTagged, setLoadingTagged] = useState(false);
    const fileInputRef = useRef(null);

    const userId = id || currentUser?.id;
    const isOwnProfile = !id || id == currentUser?.id;

    useEffect(() => {
        if (userId) loadProfile();
    }, [userId]);

    useEffect(() => {
        if (activeTab === 'tagged' && userId && !loadingTagged && taggedPosts.length === 0) {
            loadTaggedPosts();
        }
    }, [activeTab, userId]);

    const loadTaggedPosts = async () => {
        setLoadingTagged(true);
        try {
            const res = await postService.getTaggedPosts(userId);
            setTaggedPosts(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTagged(false);
        }
    };

    const loadProfile = async () => {
        try {
            const res = await userService.getUser(userId);
            setProfile(res.data);
            setName(res.data.name);
            setSurname(res.data.surname || '');
            setFirstname(res.data.firstname || '');
            setOthername(res.data.othername || '');
            setLocation(res.data.location || '');
            setBio(res.data.bio || '');
            setFavoriteVerse(res.data.favorite_verse || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const res = await userService.updateProfile({ name, surname, firstname, othername, location, bio, favorite_verse: favoriteVerse });
            const updated = { ...profile, ...res.data };
            setProfile(updated);
            if (isOwnProfile) {
                setUser({ ...currentUser, name: updated.name, surname: updated.surname, firstname: updated.firstname, othername: updated.othername, location: updated.location, bio: updated.bio, favorite_verse: updated.favorite_verse });
            }
            setEditing(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await userService.uploadAvatar(fd);
            const avatarUrl = res.data.avatar;
            setProfile({ ...profile, avatar: avatarUrl });
            if (isOwnProfile) {
                setUser({ ...currentUser, avatar: avatarUrl });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleUseRegistrationPhoto = async () => {
        try {
            const res = await userService.useRegistrationPhoto();
            const avatarUrl = res.data.avatar;
            setProfile({ ...profile, avatar: avatarUrl });
            if (isOwnProfile) {
                setUser({ ...currentUser, avatar: avatarUrl });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const displayName = profile?.surname
        ? [profile.surname, profile.firstname, profile.othername].filter(Boolean).join(' ')
        : profile?.name || '';

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
    if (!profile) return <div className="text-center py-8 text-gray-500">User not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover */}
                <div className="relative h-40 sm:h-56 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500">
                    <div className="absolute inset-0 bg-black/10" />
                    {isOwnProfile && (
                        <button onClick={() => setEditing(!editing)} className="absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-sm font-medium transition-all">
                            {editing ? '✕ Cancel' : '✏ Edit Profile'}
                        </button>
                    )}
                </div>

                {/* Profile header */}
                <div className="relative px-4 sm:px-6 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16">
                        <div className="relative group shrink-0">
                            <div className="relative">
                                <img src={avatarSrc(profile.avatar)} alt="" className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-lg bg-white object-cover" />
                                {profile.dues_card_status && profile.dues_card_status !== 'verified' && (
                                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                                        profile.dues_card_status === 'pending' ? 'bg-amber-400' : 'bg-red-500'
                                    }`} title={`Card status: ${profile.dues_card_status}`} />
                                )}
                                {profile.dues_card_status === 'verified' && (
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm bg-green-500" title="Card verified" />
                                )}
                            </div>
                            {isOwnProfile && (
                                <>
                                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium border-4 border-transparent">
                                        {avatarUploading ? '...' : 'Change Photo'}
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-2 sm:pt-0 sm:pb-1">
                            {editing ? (
                                <input value={name} onChange={(e) => setName(e.target.value)} className="text-xl font-bold border rounded-lg px-3 py-2 w-full" />
                            ) : (
                                <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
                            )}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm">
                                {profile.role && <span className="font-medium text-purple-600">{profile.role}</span>}
                                {profile.location && <span className="text-gray-500">📍 {profile.location}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Bio summary (truncated) */}
                    {!editing && profile.bio && (
                        <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-2">{profile.bio}</p>
                    )}

                    {/* Favorite verse */}
                    {!editing && profile.favorite_verse && (
                        <p className="mt-1.5 text-purple-600 font-medium text-sm flex items-center gap-1.5">
                            <span>📖</span> {profile.favorite_verse}
                        </p>
                    )}

                    {/* Stats row - evenly spaced */}
                    <div className="flex mt-5 pt-4 border-t border-gray-100">
                        <div className="flex flex-1 justify-around">
                            <Stat value={profile.posts?.length || 0} label="Posts" />
                            <Stat value={profile.events?.length || 0} label="Events" />
                            <Stat value={profile.points || 0} label="Points" />
                            <Stat value={`${profile.streak || 0}d`} label="Streak" />
                        </div>
                    </div>

                    {/* Registration photo */}
                    {!editing && profile.registration_photo && (
                        <div className="mt-4 flex items-center gap-3">
                            <button onClick={() => setPreviewPhoto(profile.registration_photo)} className="relative group shrink-0">
                                <img src={avatarSrc(profile.registration_photo)} alt="Registration" className="w-14 h-14 rounded-xl object-cover border-2 border-gray-200" />
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">View</span>
                                </div>
                            </button>
                            <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registration Photo</div>
                                <div className="text-xs text-gray-400 mt-0.5">Taken during sign-up</div>
                                {isOwnProfile && profile.avatar !== profile.registration_photo && (
                                    <button onClick={handleUseRegistrationPhoto} className="mt-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
                                        Use as profile picture
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit form */}
                {editing && (
                    <div className="px-4 sm:px-6 pb-6 border-t border-gray-100 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                            <Field label="Surname" value={surname} onChange={setSurname} />
                            <Field label="First Name" value={firstname} onChange={setFirstname} />
                            <Field label="Other Name" value={othername} onChange={setOthername} />
                        </div>
                        <div className="space-y-3">
                            <Field label="Display Name" value={name} onChange={setName} />
                            <Field label="Location" value={location} onChange={setLocation} />
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bio</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                            </div>
                            <Field label="Favorite Verse" value={favoriteVerse} onChange={setFavoriteVerse} />
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button onClick={handleSave} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-sm hover:shadow-lg transition-all">
                                Save Changes
                            </button>
                            <button onClick={() => setEditing(false)} className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs - evenly distributed */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex sm:grid sm:grid-cols-5 overflow-x-auto border-b border-gray-100 scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center justify-center gap-1.5 px-4 sm:px-2 py-3.5 text-sm font-medium transition-all border-b-2 shrink-0 ${
                                activeTab === tab.key
                                    ? 'text-purple-600 border-purple-600'
                                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="p-4 sm:p-6">
                    {activeTab === 'posts' && (
                        profile.posts?.length > 0 ? (
                            <div className="space-y-4">
                                {profile.posts.map(post => (
                                    <div key={post.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src={avatarSrc(profile.avatar)} alt="" className="w-9 h-9 rounded-full bg-purple-100 object-cover" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                                                    {post.post_type === 'live' && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1 font-medium">
                                                            <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                                                            LIVE
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {post.location && <p className="text-xs text-gray-400 mt-1">📍 {post.location}</p>}
                                        {post.tags?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {post.tags.map(t => (
                                                    <Link key={t.id} to={`/profile/${t.id}`} className="text-xs text-purple-600 hover:text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full">
                                                        @{t.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                        {post.content && <p className="text-gray-700 text-sm leading-relaxed">{post.content}</p>}
                                        {post.media_url && post.media_type === 'image' && (
                                            <img src={mediaSrc(post.media_url)} alt="" className="mt-3 rounded-xl w-full object-cover max-h-96" />
                                        )}
                                        {post.media_url && post.media_type === 'video' && (
                                            <video src={mediaSrc(post.media_url)} controls className="mt-3 rounded-xl w-full max-h-96" />
                                        )}
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                                            <span>💬 {post.comments_count || 0}</span>
                                            <span>❤️ {post.likes_count || 0}</span>
                                            <span>🔄 {post.shares_count || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">📝</div>
                                <p className="text-gray-400 font-medium">No posts yet</p>
                                <p className="text-xs text-gray-300 mt-1">Posts will appear here once shared</p>
                            </div>
                        )
                    )}

                    {activeTab === 'photos' && (
                        (profile.avatar || profile.posts?.some(p => p.media_url && p.media_type === 'image')) ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {profile.avatar && (
                                    <button onClick={() => setPreviewPhoto(profile.avatar)} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                        <img src={avatarSrc(profile.avatar)} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-2xl">🔍</span>
                                        </div>
                                        <div className="absolute bottom-1 left-1 right-1">
                                            <span className="block text-center text-[10px] text-white bg-black/50 rounded px-1 py-0.5 truncate">Profile Picture</span>
                                        </div>
                                    </button>
                                )}
                                {profile.posts.filter(p => p.media_url && p.media_type === 'image').map(post => (
                                    <button key={post.id} onClick={() => setPreviewPhoto(post.media_url)} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                        <img src={mediaSrc(post.media_url)} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-2xl">🔍</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">🖼️</div>
                                <p className="text-gray-400 font-medium">No photos yet</p>
                            </div>
                        )
                    )}

                    {activeTab === 'tagged' && (
                        loadingTagged ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="text-gray-400 text-sm mt-3">Loading tagged photos...</p>
                            </div>
                        ) : (
                            (taggedPosts.length > 0 && taggedPosts.some(p => p.media_url && p.media_type === 'image')) ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {taggedPosts.filter(p => p.media_url && p.media_type === 'image').map(post => (
                                        <button key={post.id} onClick={() => setPreviewPhoto(post.media_url)} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                                            <img src={mediaSrc(post.media_url)} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-2xl">🔍</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">🏷️</div>
                                    <p className="text-gray-400 font-medium">No tagged photos yet</p>
                                    <p className="text-xs text-gray-300 mt-1">Photos where you're tagged will appear here</p>
                                </div>
                            )
                        )
                    )}

                    {activeTab === 'events' && (
                        profile.events?.length > 0 ? (
                            <div className="space-y-3">
                                {profile.events.map(event => (
                                    <div key={event.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shrink-0">
                                            📅
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{event.title}</p>
                                            <p className="text-xs text-gray-400">{event.date ? new Date(event.date).toLocaleDateString() : ''}</p>
                                        </div>
                                        {event.location && <span className="text-xs text-gray-400 shrink-0">📍 {event.location}</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">📅</div>
                                <p className="text-gray-400 font-medium">No events yet</p>
                            </div>
                        )
                    )}

                    {activeTab === 'about' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <AboutRow icon="👤" label="Full Name" value={displayName} />
                            <AboutRow icon="📧" label="Email" value={profile.email} />
                            {profile.username && <AboutRow icon="＠" label="Username" value={profile.username} />}
                            {profile.location && <AboutRow icon="📍" label="Location" value={profile.location} />}
                            {profile.role && <AboutRow icon="👔" label="Role" value={profile.role} />}
                            {profile.bio && <AboutRow icon="💬" label="Bio" value={profile.bio} />}
                            {profile.favorite_verse && <AboutRow icon="📖" label="Favorite Verse" value={profile.favorite_verse} />}
                            {profile.points !== undefined && <AboutRow icon="⭐" label="Points" value={String(profile.points)} />}
                            {profile.streak !== undefined && <AboutRow icon="🔥" label="Streak" value={`${profile.streak} days`} />}
                            {profile.date_of_birth && <AboutRow icon="🎂" label="Date of Birth" value={new Date(profile.date_of_birth).toLocaleDateString()} />}
                            {profile.dues_card_code && <AboutRow icon="💳" label="Dues Card Code" value={profile.dues_card_code} />}
                            <AboutRow icon="📅" label="Member Since" value={new Date(profile.created_at).toLocaleDateString()} />
                        </div>
                    )}
                </div>
            </div>

            {previewPhoto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewPhoto(null)}>
                    <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img src={mediaSrc(previewPhoto)} alt="" className="w-full rounded-2xl" />
                        <button onClick={() => setPreviewPhoto(null)} className="mt-3 w-full py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ value, label }) {
    return (
        <div className="text-center">
            <div className="text-lg font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}

function AboutRow({ icon, label, value }) {
    return (
        <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-sm shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
                <div className="text-sm text-gray-800 truncate">{value}</div>
            </div>
        </div>
    );
}

function Field({ label, value, onChange }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
            <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
        </div>
    );
}
