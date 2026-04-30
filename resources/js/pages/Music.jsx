import { useState, useEffect } from 'react';
import { musicService } from '../services/api';

export default function Music() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Music Player</h1>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : tracks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No music available yet</div>
            ) : (
                <div className="grid gap-4">
                    {tracks.map(track => (
                        <div key={track.id} onClick={() => togglePlay(track)}
                            className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer flex items-center gap-4 ${currentTrack?.id === track.id ? 'ring-2 ring-purple-500' : ''}`}>
                            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                                {currentTrack?.id === track.id && isPlaying ? '🎵' : '🎶'}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{track.title}</p>
                                <p className="text-sm text-gray-500">{track.artist || 'Unknown Artist'}</p>
                            </div>
                            <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">{track.category}</span>
                        </div>
                    ))}
                </div>
            )}

            {currentTrack && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-4">
                        <img src={currentTrack.cover_url || '/default-cover.png'} alt="" className="w-12 h-12 rounded bg-purple-100" />
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{currentTrack.title}</p>
                            <p className="text-sm text-gray-500">{currentTrack.artist}</p>
                        </div>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700">
                            {isPlaying ? '⏸' : '▶'}
                        </button>
                    </div>
                    {isPlaying && (
                        <audio src={currentTrack.url} autoPlay className="hidden" onEnded={() => setIsPlaying(false)} />
                    )}
                </div>
            )}
        </div>
    );
}