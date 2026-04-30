import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function PrayersPanel() {
    const [prayers, setPrayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadPrayers();
    }, [search]);

    const loadPrayers = async () => {
        try {
            const res = await adminService.getPrayers({ search });
            setPrayers(res.data.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this prayer request?')) return;
        try {
            await adminService.deletePrayer(id);
            loadPrayers();
        } catch (err) {
            alert('Failed to delete prayer');
        }
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Prayer Requests</h2>
                <input
                    type="text"
                    placeholder="Search prayers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
            </div>

            <div className="space-y-4">
                {prayers.map(prayer => (
                    <div key={prayer.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {prayer.is_anonymous ? (
                                        <span className="text-gray-500">Anonymous</span>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 text-sm font-medium">
                                                {prayer.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-800">{prayer.user?.name}</span>
                                        </>
                                    )}
                                    <span className="text-gray-500 text-sm">• {new Date(prayer.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 bg-pink-50 p-3 rounded-lg">{prayer.prayer_request}</p>
                                <div className="mt-2 text-sm text-gray-500">
                                    🙏 {prayer.prayer_count || 0} prayers
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(prayer.id)}
                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 shrink-0"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {prayers.length === 0 && (
                <div className="text-center py-8 text-gray-500">No prayer requests found</div>
            )}
        </div>
    );
}