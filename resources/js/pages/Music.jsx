import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { musicService } from '../services/api';

export default function Music() {
    const { user } = useAuth();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: '', artist: '', category: '', url: '', cover_url: '' });
    const [audioFile, setAudioFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        loadMusic();
    }, []);

    const loadMusic = async () => {
        try {
            const res = await musicService.getMusic();
            setTracks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const togglePlay = (track) => {
        if (currentTrack?.id === track.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.title || (!form.url && !audioFile)) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            if (form.artist) fd.append('artist', form.artist);
            if (form.category) fd.append('category', form.category);
            if (audioFile) {
                fd.append('audio_file', audioFile);
            } else {
                fd.append('url', form.url);
            }
            if (coverFile) {
                fd.append('cover_image', coverFile);
            } else if (form.cover_url) {
                fd.append('cover_url', form.cover_url);
            }
            const res = await musicService.addMusic(fd);
            setTracks((prev) => [res.data, ...prev]);
            setForm({ title: '', artist: '', category: '', url: '', cover_url: '' });
            setAudioFile(null);
            setCoverFile(null);
            setShowAdd(false);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this track?')) return;
        try {
            await musicService.deleteMusic(id);
            setTracks((prev) => prev.filter((t) => t.id !== id));
            if (currentTrack?.id === id) {
                setCurrentTrack(null);
                setIsPlaying(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const audioEnded = () => {
        const idx = tracks.findIndex((t) => t.id === currentTrack?.id);
        if (idx >= 0 && idx < tracks.length - 1) {
            setCurrentTrack(tracks[idx + 1]);
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Music Player</h1>
                {user && (
                    <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                        + Add Music
                    </button>
                )}
            </div>

            {showAdd && (
                <form onSubmit={handleAdd} className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title *" required className="p-3 border rounded-lg" />
                        <input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} placeholder="Artist" className="p-3 border rounded-lg" />
                        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category (e.g. Worship, Gospel)" className="p-3 border rounded-lg" />
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Audio File</label>
                            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="p-2 border rounded-lg w-full" />
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-400 mb-1">Or paste a URL instead of uploading</p>
                            <input value={form.url} onChange={(e) => { setForm({ ...form, url: e.target.value }); if (e.target.value) setAudioFile(null); }} placeholder="Audio URL (YouTube, SoundCloud, etc.)" className="p-3 border rounded-lg w-full" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Cover Image</label>
                            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="p-2 border rounded-lg w-full" />
                        </div>
                        <input value={form.cover_url} onChange={(e) => { setForm({ ...form, cover_url: e.target.value }); if (e.target.value) setCoverFile(null); }} placeholder="Or cover image URL" className="p-3 border rounded-lg" />
                    </div>
                    <button type="submit" disabled={uploading} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
                        {uploading ? 'Uploading...' : 'Add Track'}
                    </button>
                </form>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : tracks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No music available yet</div>
            ) : (
                <div className="grid gap-4">
                    {tracks.map((track) => (
                        <div key={track.id} className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm flex items-center gap-3 sm:gap-4 ${currentTrack?.id === track.id ? 'ring-2 ring-purple-500' : ''}`}>
                            <button onClick={() => togglePlay(track)} className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-100 rounded-lg flex items-center justify-center text-lg sm:text-2xl shrink-0 hover:bg-purple-200">
                                {currentTrack?.id === track.id && isPlaying ? '⏸' : '▶'}
                            </button>
                            {track.cover_url && (
                                <img src={track.cover_url} alt="" className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate text-sm sm:text-base">{track.title}</p>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">{track.artist || 'Unknown Artist'}</p>
                            </div>
                            <span className="text-[10px] sm:text-xs text-purple-600 bg-purple-50 px-1.5 sm:px-2 py-1 rounded shrink-0 hidden sm:inline">{track.category || 'General'}</span>
                            {user && (
                                <button onClick={() => handleDelete(track.id)} className="text-red-400 hover:text-red-600 text-sm shrink-0">
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {currentTrack && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <img src={currentTrack.cover_url || '/default-cover.png'} alt="" className="w-12 h-12 rounded object-cover bg-purple-100" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{currentTrack.title}</p>
                            <p className="text-sm text-gray-500 truncate">{currentTrack.artist}</p>
                        </div>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 shrink-0">
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                    </div>
                    {isPlaying && (
                        <audio ref={audioRef} src={currentTrack.url} autoPlay className="hidden" onEnded={audioEnded} />
                    )}
                </div>
            )}
        </div>
    );
}
