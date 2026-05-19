import { useState, useEffect } from 'react';
import { adminLiveService } from '../../services/api';

export default function StreamingPanel() {
    const [sessions, setSessions] = useState([]);
    const [activeStreams, setActiveStreams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [streamKey, setStreamKey] = useState('');
    const [rtmpUrl, setRtmpUrl] = useState('');
    const [playUrl, setPlayUrl] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const [sessRes, activeRes] = await Promise.all([
                adminLiveService.getSessions(),
                adminLiveService.getActiveStreams(),
            ]);
            setSessions(sessRes.data.data || []);
            setActiveStreams(activeRes.data || []);
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleGenerateKey = async () => {
        try {
            const res = await adminLiveService.generateStreamKey();
            setStreamKey(res.data.stream_key);
            setRtmpUrl(res.data.rtmp_url);
            setPlayUrl(res.data.play_url);
        } catch { alert('Failed to generate key'); }
    };

    const handleForceEnd = async (id) => {
        if (!confirm('Force end this stream?')) return;
        try {
            await adminLiveService.forceEndStream(id);
            load();
        } catch { alert('Failed to end stream'); }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-2">🔴 Stream Setup</h3>
                <p className="text-white/70 text-sm mb-4">Generate a stream key to use with OBS, Streamlabs, or any RTMP-compatible software.</p>
                <button onClick={handleGenerateKey} className="px-5 py-2.5 bg-white text-purple-700 rounded-xl font-bold text-sm hover:bg-purple-50 transition-all">
                    Generate Stream Key
                </button>
                {streamKey && (
                    <div className="mt-4 space-y-3 bg-white/10 rounded-lg p-4">
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wider">RTMP URL</label>
                            <div className="flex gap-2 mt-1">
                                <input readOnly value={rtmpUrl} className="flex-1 bg-white/20 text-white text-sm px-3 py-2 rounded-lg font-mono" />
                                <button onClick={() => copyToClipboard(rtmpUrl)} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs">📋</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wider">Stream Key</label>
                            <div className="flex gap-2 mt-1">
                                <input readOnly value={streamKey} className="flex-1 bg-white/20 text-white text-sm px-3 py-2 rounded-lg font-mono tracking-widest" />
                                <button onClick={() => copyToClipboard(streamKey)} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs">📋</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-white/60 uppercase tracking-wider">Playback URL (HLS)</label>
                            <div className="flex gap-2 mt-1">
                                <input readOnly value={playUrl} className="flex-1 bg-white/20 text-white text-sm px-3 py-2 rounded-lg font-mono" />
                                <button onClick={() => copyToClipboard(playUrl)} className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs">📋</button>
                            </div>
                        </div>
                        <p className="text-xs text-white/50 mt-2">Enter the RTMP URL and Stream Key in OBS → Settings → Stream → Custom...</p>
                    </div>
                )}
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Active Streams ({activeStreams.length})
                </h3>
                {activeStreams.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-sm">No active streams</p>
                ) : (
                    <div className="space-y-2">
                        {activeStreams.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center text-white font-bold">
                                        {s.user?.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{s.user?.name}</div>
                                        <div className="text-xs text-gray-400">{s.title || 'Untitled'} · {s.viewer_count || 0} viewers</div>
                                    </div>
                                </div>
                                <button onClick={() => handleForceEnd(s.id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all">
                                    ✕ End
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-3">All Stream Sessions</h3>
                {loading ? (
                    <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
                ) : sessions.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-sm">No sessions yet</p>
                ) : (
                    <div className="space-y-2">
                        {sessions.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'live' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-800 truncate">{s.user?.name}</div>
                                        <div className="text-xs text-gray-400 truncate">{s.title || 'Untitled'} · {s.status}</div>
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ml-2 ${s.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
