import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

export default function Profile() {
    const { id } = useParams();
    const { user: currentUser, setUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [favoriteVerse, setFavoriteVerse] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const fileInputRef = useRef(null);

    const userId = id || currentUser?.id;
    const isOwnProfile = !id || id == currentUser?.id;

    useEffect(() => {
        if (userId) loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            const res = await userService.getUser(userId);
            setProfile(res.data);
            setName(res.data.name);
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
            await userService.updateProfile({ name, bio, favorite_verse: favoriteVerse });
            setProfile({ ...profile, name, bio, favorite_verse: favoriteVerse });
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

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;
    if (!profile) return <div className="text-center py-8 text-gray-500">User not found</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative group">
                        <img src={profile.avatar || '/default-avatar.png'} alt="" className="w-20 h-20 rounded-full bg-purple-100 object-cover" />
                        {isOwnProfile && (
                            <>
                                <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                                    {avatarUploading ? '...' : 'Change'}
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                            </>
                        )}
                    </div>
                    <div>
                        {editing ? (
                            <input value={name} onChange={(e) => setName(e.target.value)} className="text-xl font-bold border rounded px-2 py-1" />
                        ) : (
                            <h1 className="text-2xl font-bold text-gray-800">{profile.name}</h1>
                        )}
                        {profile.role && <p className="text-sm font-medium text-purple-600">{profile.role}</p>}
                        <p className="text-gray-500">{profile.points} points • {profile.streak} day streak</p>
                    </div>
                </div>

                {profile.registration_photo && (
                    <div className="mb-4">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setPreviewPhoto(profile.registration_photo)} className="relative group shrink-0">
                                <img src={profile.registration_photo} alt="Registration" className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200" />
                                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">View</span>
                                </div>
                            </button>
                            <div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Photo</div>
                                <div className="text-xs text-gray-400 mt-0.5">Taken during sign-up</div>
                            </div>
                        </div>
                        {isOwnProfile && profile.avatar !== profile.registration_photo && (
                            <button onClick={handleUseRegistrationPhoto} className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
                                📸 Use as profile picture
                            </button>
                        )}
                    </div>
                )}

                {editing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Favorite Verse</label>
                            <input value={favoriteVerse} onChange={(e) => setFavoriteVerse(e.target.value)} className="w-full p-3 border rounded-lg" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium">Save</button>
                            <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg font-medium">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {profile.bio && <p className="text-gray-600 mb-3">{profile.bio}</p>}
                        {profile.favorite_verse && <p className="text-purple-600 font-medium">📖 {profile.favorite_verse}</p>}
                        {isOwnProfile && (
                            <button onClick={() => setEditing(true)} className="mt-4 text-purple-600 font-medium">Edit Profile</button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Posts</h2>
                {profile.posts?.length > 0 ? (
                    profile.posts.map(post => (
                        <div key={post.id} className="py-3 border-b last:border-0">
                            <p className="text-gray-700">{post.content}</p>
                            <p className="text-sm text-gray-500 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No posts yet</p>
                )}
            </div>

            {previewPhoto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewPhoto(null)}>
                    <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <img src={previewPhoto} alt="Registration photo" className="w-full rounded-xl" />
                        <button onClick={() => setPreviewPhoto(null)} className="mt-3 w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
