import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { liveService } from '../../services/api';

export default function LiveStream({ onClose }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [streaming, setStreaming] = useState(false);
    const [liveSession, setLiveSession] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

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
        try {
            await liveService.endLive(liveSession.id, true);
            stopCamera();
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

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
            <div className="flex items-center justify-between p-4">
                <span className="flex items-center gap-2 text-white font-semibold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    LIVE
                </span>
                <span className="text-white/50 text-sm">{liveSession?.title}</span>
                <button
                    onClick={handleEndLive}
                    className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                    End
                </button>
            </div>
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-contain" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white/70 text-xs">Recording</span>
                </div>
                <div className="absolute bottom-4 right-4">
                    <span className="text-white/50 text-xs px-3 py-1 bg-black/50 rounded-full">
                        {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
