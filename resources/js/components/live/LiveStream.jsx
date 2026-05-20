import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { liveService } from '../../services/api';

const GIFTS = [
    { type: 'rose', icon: '🌹', label: 'Rose', points: 5 },
    { type: 'heart', icon: '💖', label: 'Heart', points: 10 },
    { type: 'fire', icon: '🔥', label: 'Fire', points: 15 },
    { type: 'pray', icon: '🙏', label: 'Pray', points: 20 },
    { type: 'blessing', icon: '✨', label: 'Blessing', points: 25 },
    { type: 'crown', icon: '👑', label: 'Crown', points: 50 },
];

export default function LiveStream({ onClose }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [liveSession, setLiveSession] = useState(null);
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [hearts, setHearts] = useState([]);
    const [giftAnimations, setGiftAnimations] = useState([]);
    const [elapsed, setElapsed] = useState('0:00');
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const chatRef = useRef(null);
    const pollRef = useRef(null);
    const heartIdRef = useRef(0);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    useEffect(() => {
        if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [streaming]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
                audio: true,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch {
            setError('Camera access denied. Please allow camera permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    const handleGoLive = async () => {
        if (!title.trim()) {
            setError('Please enter a title for your live stream');
            return;
        }
        setError('');
        try {
            const res = await liveService.startLive({ title });
            setLiveSession(res.data);
            setStreaming(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start live');
        }
    };

    const handleEndLive = async () => {
        if (!liveSession) return;
        clearInterval(pollRef.current);
        try {
            await liveService.endLive(liveSession.id, true);
            stopCamera();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    const loadComments = useCallback(async () => {
        if (!liveSession) return;
        try {
            const res = await liveService.getComments(liveSession.id);
            setComments(res.data || []);
        } catch {}
    }, [liveSession]);

    const loadSession = useCallback(async () => {
        if (!liveSession) return;
        try {
            const res = await liveService.getLiveSession(liveSession.id);
            const s = res.data;
            if (s.heart_count > (liveSession.heart_count || 0)) {
                const id = ++heartIdRef.current;
                setHearts(prev => [...prev, { id, x: Math.random() * 60 + 20, time: Date.now() }]);
                setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 1500);
            }
            setLiveSession(prev => ({ ...prev, ...s }));
        } catch {}
    }, [liveSession?.id]);

    useEffect(() => {
        if (!streaming || !liveSession) return;
        loadComments();
        loadSession();
        pollRef.current = setInterval(() => {
            loadComments();
            loadSession();
        }, 3000);
        return () => clearInterval(pollRef.current);
    }, [streaming, liveSession?.id, loadComments, loadSession]);

    useEffect(() => {
        if (!streaming) return;
        const start = Date.now();
        const iv = setInterval(() => {
            const s = Math.floor((Date.now() - start) / 1000);
            const m = Math.floor(s / 60);
            const sec = s % 60;
            setElapsed(`${m}:${sec.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(iv);
    }, [streaming]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [comments]);

    if (!streaming) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex flex-col">
                <div className="flex items-center justify-between p-4">
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl">&times;</button>
                    <span className="text-white font-semibold">Go Live</span>
                    <div className="w-8" />
                </div>
                <div className="flex-1 relative bg-gray-900">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-4 space-y-3">
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's your live about?"
                        className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-700 focus:ring-2 focus:ring-red-500 text-sm"
                        maxLength={100}
                    />
                    <button
                        onClick={handleGoLive}
                        disabled={!title.trim()}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        Go Live
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="absolute inset-0 bg-gray-900">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-3">
                        <button onClick={handleEndLive} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            End
                        </button>
                        <span className="text-white/60 text-xs font-mono">{elapsed}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-white/70 text-xs bg-black/40 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            {liveSession?.viewer_count || 0} watching
                        </span>
                        <span className="text-white font-semibold text-sm truncate max-w-[120px]">{liveSession?.title}</span>
                    </div>
                </div>

                <div className="flex-1 relative">
                    {hearts.map(h => (
                        <div
                            key={h.id}
                            className="absolute text-3xl animate-bounce pointer-events-none"
                            style={{ left: `${h.x}%`, bottom: '20%', animationDuration: '0.8s' }}
                        >
                            💖
                        </div>
                    ))}
                    {giftAnimations.map(g => (
                        <div
                            key={g.id}
                            className="absolute top-1/3 left-1/2 -translate-x-1/2 text-5xl animate-bounce pointer-events-none z-10"
                            style={{ animationDuration: '1.5s' }}
                        >
                            {g.icon}
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12 pb-4 px-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                            {user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm">{user?.name}</p>
                            <p className="text-white/50 text-[10px]">{liveSession?.viewer_count || 0} watching</p>
                        </div>
                    </div>

                    <div ref={chatRef} className="max-h-32 overflow-y-auto space-y-1.5 mb-3 scrollbar-thin">
                        {comments.map((c, i) => (
                            <div key={c.id || i} className="flex items-start gap-1.5 bg-black/30 rounded-lg px-2.5 py-1.5 backdrop-blur-sm">
                                <span className="text-white font-semibold text-xs shrink-0">{c.user?.name}:</span>
                                <span className="text-white/80 text-xs break-words">{c.message}</span>
                            </div>
                        ))}
                        {comments.length === 0 && (
                            <p className="text-white/30 text-xs text-center py-2">No comments yet</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2.5 backdrop-blur-sm">
                            <input
                                placeholder="Live chat..."
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40"
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                        try {
                                            await liveService.sendComment(liveSession.id, e.target.value);
                                            e.target.value = '';
                                        } catch {}
                                    }
                                }}
                            />
                            <span className="text-white/30 text-xs">💬</span>
                        </div>
                        <button
                            onClick={async () => {
                                try {
                                    await liveService.sendHeart(liveSession.id);
                                    const id = ++heartIdRef.current;
                                    setHearts(prev => [...prev, { id, x: Math.random() * 60 + 20, time: Date.now() }]);
                                    setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 1500);
                                } catch {}
                            }}
                            className="w-11 h-11 bg-pink-600 rounded-full flex items-center justify-center text-xl hover:bg-pink-500 transition-colors shrink-0"
                        >
                            💖
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    const gift = GIFTS[Math.floor(Math.random() * GIFTS.length)];
                                    await liveService.sendGift(liveSession.id, gift.type);
                                    const id = Date.now();
                                    setGiftAnimations(prev => [...prev, { id, icon: gift.icon, label: gift.label }]);
                                    setTimeout(() => setGiftAnimations(prev => prev.filter(g => g.id !== id)), 2500);
                                } catch {}
                            }}
                            className="w-11 h-11 bg-purple-600 rounded-full flex items-center justify-center text-xl hover:bg-purple-500 transition-colors shrink-0"
                        >
                            🎁
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
