import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { liveService } from '../../services/api';
import Hls from 'hls.js';

const GIFTS = [
    { type: 'rose', icon: '🌹', label: 'Rose', points: 5 },
    { type: 'heart', icon: '💖', label: 'Heart', points: 10 },
    { type: 'fire', icon: '🔥', label: 'Fire', points: 15 },
    { type: 'pray', icon: '🙏', label: 'Pray', points: 20 },
    { type: 'blessing', icon: '✨', label: 'Blessing', points: 25 },
    { type: 'crown', icon: '👑', label: 'Crown', points: 50 },
];

export default function LiveViewer({ sessionId, onClose }) {
    const { user } = useAuth();
    const [session, setSession] = useState(null);
    const [comments, setComments] = useState([]);
    const [gifts, setGifts] = useState([]);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [joined, setJoined] = useState(false);
    const [hearts, setHearts] = useState([]);
    const [showGiftShop, setShowGiftShop] = useState(false);
    const [giftAnimations, setGiftAnimations] = useState([]);
    const chatRef = useRef(null);
    const pollRef = useRef(null);
    const heartIdRef = useRef(0);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);

    useEffect(() => {
        loadSession();
        return () => {
            clearInterval(pollRef.current);
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (joined) liveService.leaveLive(sessionId).catch(() => {});
        };
    }, [sessionId]);

    const loadSession = async () => {
        try {
            const res = await liveService.getLiveSession(sessionId);
            setSession(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const loadComments = useCallback(async () => {
        try {
            const res = await liveService.getComments(sessionId);
            setComments(res.data || []);
        } catch {}
    }, [sessionId]);

    const loadGifts = useCallback(async () => {
        try {
            const res = await liveService.getGifts(sessionId);
            setGifts(res.data || []);
        } catch {}
    }, [sessionId]);

    useEffect(() => {
        loadComments();
        loadGifts();
        pollRef.current = setInterval(() => {
            loadComments();
            loadGifts();
            if (joined) liveService.sendHeart(sessionId).catch(() => {});
        }, 3000);
    }, [sessionId, joined, loadComments, loadGifts]);

    const handleJoin = async () => {
        try {
            await liveService.joinLive(sessionId);
            setJoined(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || sending) return;
        setSending(true);
        try {
            const res = await liveService.sendComment(sessionId, message);
            setComments(prev => [...prev, res.data]);
            setMessage('');
            setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 50);
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleHeart = async () => {
        if (!joined) return;
        try {
            await liveService.sendHeart(sessionId);
            const id = ++heartIdRef.current;
            setHearts(prev => [...prev, { id, x: Math.random() * 60 + 20, time: Date.now() }]);
            setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 1500);
        } catch {}
    };

    const handleGift = async (giftType) => {
        if (!joined) return;
        try {
            await liveService.sendGift(sessionId, giftType);
            const gift = GIFTS.find(g => g.type === giftType);
            const id = Date.now();
            setGiftAnimations(prev => [...prev, { id, icon: gift?.icon || '🎁', label: gift?.label || giftType }]);
            setTimeout(() => setGiftAnimations(prev => prev.filter(g => g.id !== id)), 2500);
            setShowGiftShop(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, [comments]);

    if (!session) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
            </div>
        );
    }

    const isLive = session.status === 'live';
    const isBroadcaster = user?.id === session.user_id;
    const hasHls = session.stream_key;

    useEffect(() => {
        if (isLive && hasHls && videoRef.current) {
            const hlsUrl = `http://${window.location.hostname}:8001/live/${session.stream_key}.m3u8`;
            if (Hls.isSupported()) {
                const hls = new Hls();
                hlsRef.current = hls;
                hls.loadSource(hlsUrl);
                hls.attachMedia(videoRef.current);
            } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                videoRef.current.src = hlsUrl;
            }
        }
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [isLive, hasHls, session.stream_key]);

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 gap-2">
                <button onClick={onClose} className="text-white/70 hover:text-white text-2xl shrink-0">&times;</button>
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {isLive && (
                        <span className="flex items-center gap-1 text-xs text-white/70 bg-white/10 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="hidden sm:inline">{session.viewer_count || 0}</span>
                            <span>{session.viewer_count === 1 ? 'viewer' : 'viewers'}</span>
                        </span>
                    )}
                    {isLive ? (
                        <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            LIVE
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400 bg-gray-700 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Ended</span>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row">
                <div className="flex-1 bg-gray-900 flex items-center justify-center relative min-h-[35vh] lg:min-h-[40vh] overflow-hidden">
                    {isLive && hasHls ? (
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain" />
                    ) : isLive ? (
                        <div className="text-center px-4 py-6 sm:p-8">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl sm:text-5xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg shadow-purple-500/30">
                                {session.user?.name?.charAt(0) || '?'}
                            </div>
                            <h3 className="text-white text-lg sm:text-2xl font-bold">{session.user?.name}</h3>
                            <p className="text-gray-400 text-xs sm:text-sm mt-1">{session.title}</p>

                            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
                                <button onClick={handleHeart} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-pink-600/80 hover:bg-pink-600 text-white rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2">
                                    💖 <span className="hidden sm:inline">Like</span>
                                </button>
                                <button onClick={() => setShowGiftShop(true)} className="px-3 sm:px-5 py-1.5 sm:py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2">
                                    🎁 <span className="hidden sm:inline">Gift</span>
                                </button>
                            </div>

                            {!joined && !isBroadcaster && (
                                <button onClick={handleJoin} className="mt-3 sm:mt-4 px-6 sm:px-8 py-2 sm:py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2 mx-auto animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-white" />
                                    Join Live
                                </button>
                            )}

                            <div className="flex items-center justify-center gap-4 mt-3 sm:mt-4 text-xs text-gray-500">
                                <span>💖 {session.heart_count || 0}</span>
                                <span>🎁 {gifts.length}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center px-4 py-6 sm:p-8">
                            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔴</div>
                            <p className="text-white text-lg sm:text-xl font-bold">Live Ended</p>
                            <p className="text-gray-400 text-xs sm:text-sm mt-2">{session.title}</p>
                            <button onClick={onClose} className="mt-4 sm:mt-6 px-5 sm:px-6 py-2 bg-white/10 text-white rounded-xl text-xs sm:text-sm hover:bg-white/20 transition-colors">
                                Close
                            </button>
                        </div>
                    )}

                    {hearts.map(h => (
                        <div
                            key={h.id}
                            className="absolute text-2xl animate-bounce pointer-events-none"
                            style={{ left: `${h.x}%`, bottom: '20%', animationDuration: '0.8s' }}
                        >
                            💖
                        </div>
                    ))}

                    {giftAnimations.map(g => (
                        <div
                            key={g.id}
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-bounce pointer-events-none z-10"
                            style={{ animationDuration: '1.5s' }}
                        >
                            {g.icon}
                        </div>
                    ))}
                </div>

                <div className="w-full lg:w-80 bg-gray-800 flex flex-col max-h-[40vh] lg:max-h-none">
                    <div className="flex items-center justify-between px-3 py-2 sm:px-3 sm:py-3 border-b border-gray-700">
                        <p className="text-white text-xs sm:text-sm font-semibold">Live Chat</p>
                        {isLive && <span className="text-xs text-green-400">{session.heart_count || 0} 💖</span>}
                    </div>

                    <div ref={chatRef} className="flex-1 overflow-y-auto px-3 py-2 sm:p-3 space-y-2">
                        {comments.length === 0 && (
                            <p className="text-gray-500 text-xs text-center py-8">No messages yet</p>
                        )}
                        {comments.map((c, i) => (
                            <div key={c.id || i} className="flex items-start gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {c.user?.name?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0">
                                    <span className="text-white text-xs font-semibold">{c.user?.name}</span>
                                    <p className="text-gray-300 text-xs break-words">{c.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-2 sm:p-3 border-t border-gray-700 space-y-1.5 sm:space-y-2">
                        {isLive && (
                            <>
                                <div className="flex gap-2">
                                    <input
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Say something..."
                                        className="flex-1 min-w-0 px-2 sm:px-3 py-2 bg-gray-700 text-white rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={sending || !message.trim()}
                                        className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors shrink-0"
                                    >
                                        Send
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleHeart} className="flex-1 px-2 py-1.5 bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 rounded-lg text-xs font-medium transition-colors">
                                        💖 Like
                                    </button>
                                    <button onClick={() => setShowGiftShop(true)} className="flex-1 px-2 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg text-xs font-medium transition-colors">
                                        🎁 Gift
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showGiftShop && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center" onClick={() => setShowGiftShop(false)}>
                    <div className="bg-gray-800 rounded-t-2xl w-full max-w-lg p-4 sm:p-5" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-white font-bold text-sm sm:text-base">Send a Gift</h3>
                            <button onClick={() => setShowGiftShop(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {GIFTS.map(gift => (
                                <button
                                    key={gift.type}
                                    onClick={() => handleGift(gift.type)}
                                    className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
                                >
                                    <span className="text-2xl sm:text-3xl">{gift.icon}</span>
                                    <span className="text-white text-[10px] sm:text-xs font-medium">{gift.label}</span>
                                    <span className="text-yellow-400 text-[9px] sm:text-[10px]">{gift.points} pts</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
