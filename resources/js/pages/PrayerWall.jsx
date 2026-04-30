import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { prayerService } from '../services/api';

export default function PrayerWall() {
    const { user } = useAuth();
    const [prayers, setPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newPrayer, setNewPrayer] = useState('');
    const [showName, setShowName] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPrayers();
    }, []);

    const loadPrayers = async () => {
        try {
            const res = await prayerService.getPrayers();
            setPrayers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newPrayer.trim()) return;
        setSubmitting(true);
        try {
            await prayerService.createPrayer({
                prayer_request: newPrayer,
                is_anonymous: !showName,
            });
            setNewPrayer('');
            setShowName(false);
            setShowForm(false);
            loadPrayers();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePray = async (id) => {
        try {
            const res = await prayerService.pray(id);
            setPrayers(prayers.map(p => p.id === id ? { ...p, prayer_count: res.data.prayer_count } : p));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    🙏 Prayer Wall
                </h1>
                {user && (
                    <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                        + Add Prayer
                    </button>
                )}
            </div>

            {showForm && user && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm">
                    <textarea value={newPrayer} onChange={(e) => setNewPrayer(e.target.value)} placeholder="Share your prayer request..."
                        className="w-full p-3 border rounded-lg mb-3" rows={4} />
                    <div className="flex items-center gap-3 mb-3">
                        <input type="checkbox" id="showName" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="w-4 h-4" />
                        <label htmlFor="showName" className="text-gray-700">Show my name</label>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" disabled={submitting} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50">
                            {submitting ? 'Posting...' : 'Post Prayer'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg font-medium">Cancel</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : prayers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No prayer requests yet. Be the first to share!</div>
            ) : (
                <div className="grid gap-4">
                    {prayers.map(prayer => (
                        <div key={prayer.id} className="bg-white rounded-xl p-5 shadow-sm">
                            <p className="text-gray-800 mb-3 text-lg">{prayer.prayer_request}</p>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">
                                        {prayer.is_anonymous ? '🙏 Anonymous' : `🙏 ${prayer.name}`}
                                    </span>
                                    <span className="text-gray-400 text-sm">• {new Date(prayer.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handlePray(prayer.id)} className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200">
                                        <span>🙏</span>
                                        <span className="font-medium">{prayer.prayer_count}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!user && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <p className="text-purple-800">Login to add prayer requests</p>
                </div>
            )}
        </div>
    );
}