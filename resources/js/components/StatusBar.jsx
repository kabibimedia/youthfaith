import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { statusService } from '../services/api';

export default function StatusBar() {
    const { user: currentUser } = useAuth();
    const [statuses, setStatuses] = useState([]);
    const [myStatuses, setMyStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewingStatuses, setViewingStatuses] = useState([]);
    const [statusType, setStatusType] = useState('text');
    const [content, setContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadStatuses();
    }, []);

    const loadStatuses = async () => {
        try {
            const res = await statusService.getStatuses();
            const myRes = await statusService.getMyStatuses();
            setStatuses(Object.values(res.data));
            setMyStatuses(myRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (statusType === 'text' && !content.trim()) {
            alert('Please enter text');
            return;
        }
        if ((statusType === 'image' || statusType === 'video') && !mediaFile) {
            alert('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('type', statusType);
        if (content) formData.append('content', content);
        if (mediaFile) formData.append('media', mediaFile);

        try {
            await statusService.createStatus(formData);
            setShowModal(false);
            setContent('');
            setMediaFile(null);
            setMediaPreview(null);
            setStatusType('text');
            loadStatuses();
        } catch (err) {
            console.error(err);
            alert('Failed to create status');
        }
    };

    const openViewer = (userStatuses) => {
        setViewingStatuses(userStatuses);
        setCurrentIndex(0);
        setShowViewer(true);
    };

    const goNext = () => {
        if (currentIndex < viewingStatuses.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowViewer(false);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const currentStatus = viewingStatuses[currentIndex];

    return (
        <>
            <div className="bg-white rounded-2xl p-4 shadow-lg shadow-purple-100 border border-purple-50">
                <div className="flex gap-4 overflow-x-auto pb-2">
                    <button 
                        onClick={() => setShowModal(true)}
                        className="flex flex-col items-center gap-1.5 shrink-0"
                    >
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-purple-300 flex items-center justify-center bg-purple-50 hover:bg-purple-100 transition-colors">
                                {currentUser?.avatar ? (
                                    <img src={`/storage/${currentUser.avatar}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl">+</span>
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm">+</span>
                        </div>
                        <span className="text-xs text-gray-600">Add Status</span>
                    </button>

                    {loading ? (
                        <div className="flex gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse flex flex-col items-center gap-1.5">
                                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                                    <div className="w-12 h-3 bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {myStatuses.length > 0 && (
                                <button onClick={() => openViewer(myStatuses)} className="flex flex-col items-center gap-1.5 shrink-0">
                                    <div className="p-0.5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500">
                                        <div className="p-0.5 bg-white rounded-full">
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                                                {currentUser?.avatar ? (
                                                    <img src={`/storage/${currentUser.avatar}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                                        {currentUser?.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-600">My Status</span>
                                </button>
                            )}

                            {statuses.map((userStatuses, idx) => {
                                const firstStatus = userStatuses[0];
                                const user = firstStatus?.user;
                                if (user?.id === currentUser?.id) return null;
                                return (
                                    <button key={idx} onClick={() => openViewer(userStatuses)} className="flex flex-col items-center gap-1.5 shrink-0">
                                        <div className="p-0.5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-yellow-500">
                                            <div className="p-0.5 bg-white rounded-full">
                                                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100">
                                                    {user?.avatar ? (
                                                        <img src={`/storage/${user.avatar}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                            {user?.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-600 truncate max-w-[64px]">{user?.name?.split(' ')[0]}</span>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">My Status</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setStatusType('text'); setMediaFile(null); setMediaPreview(null); }}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${statusType === 'text' ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Text
                                </button>
                                <button
                                    onClick={() => { setStatusType('image'); }}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${statusType === 'image' ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Photo
                                </button>
                                <button
                                    onClick={() => { setStatusType('video'); }}
                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${statusType === 'video' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    Video
                                </button>
                            </div>

                            {statusType === 'text' ? (
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full h-40 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500"
                                    maxLength={500}
                                />
                            ) : (
                                <div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept={statusType === 'image' ? 'image/*' : 'video/*'}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition-all"
                                    >
                                        {mediaPreview ? (
                                            statusType === 'image' ? (
                                                <img src={mediaPreview} alt="Preview" className="max-h-60 mx-auto rounded-lg object-contain" />
                                            ) : (
                                                <video src={mediaPreview} className="max-h-60 mx-auto rounded-lg" controls />
                                            )
                                        ) : (
                                            <>
                                                <span className="text-4xl block mb-2">{statusType === 'image' ? '📷' : '🎬'}</span>
                                                <span className="text-gray-600">Tap to select {statusType}</span>
                                            </>
                                        )}
                                    </button>
                                    {mediaFile && (
                                        <p className="text-sm text-gray-500 mt-2 text-center">{mediaFile.name}</p>
                                    )}
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Add a caption..."
                                        className="w-full h-20 p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 mt-3"
                                        maxLength={500}
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium"
                            >
                                Share Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewer && currentStatus && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col" onClick={() => setShowViewer(false)}>
                    <div className="absolute top-0 left-0 right-0 z-10 p-4">
                        <div className="flex gap-1">
                            {viewingStatuses.map((_, i) => (
                                <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-white transition-all duration-200"
                                        style={{ width: i < currentIndex ? '100%' : i === currentIndex ? '50%' : '0%' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="absolute top-12 left-0 right-0 z-10 px-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                            {currentStatus.user?.avatar ? (
                                <img src={`/storage/${currentStatus.user.avatar}`} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                    {currentStatus.user?.name?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold">{currentStatus.user?.name}</p>
                            <p className="text-white/70 text-xs">
                                {new Date(currentStatus.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setShowViewer(false); }} className="text-white text-2xl hover:text-gray-300">&times;</button>
                    </div>

                    <div 
                        className="flex-1 flex items-center justify-center cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            if (e.clientX < rect.width / 2) goPrev();
                            else goNext();
                        }}
                    >
                        {currentStatus.type === 'text' ? (
                            <div className="text-center p-8 max-w-lg">
                                <p className="text-white text-2xl font-medium leading-relaxed">{currentStatus.content}</p>
                            </div>
                        ) : currentStatus.type === 'image' ? (
                            <img src={`/storage/${currentStatus.media_url}`} alt="" className="max-h-full max-w-full object-contain" />
                        ) : currentStatus.type === 'video' ? (
                            <video src={`/storage/${currentStatus.media_url}`} className="max-h-full max-w-full" controls onClick={e => e.stopPropagation()} />
                        ) : null}
                    </div>

                    {currentStatus.content && currentStatus.type !== 'text' && (
                        <div className="absolute bottom-8 left-0 right-0 px-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto">
                                <p className="text-white text-center">{currentStatus.content}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
