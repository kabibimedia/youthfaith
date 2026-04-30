import { useState, useEffect } from 'react';
import { devotionalService } from '../services/api';

export default function Devotionals() {
    const [devotionals, setDevotionals] = useState([]);
    const [today, setToday] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        loadDevotionals();
    }, []);

    const loadDevotionals = async () => {
        try {
            const [resToday, resAll] = await Promise.all([
                devotionalService.getToday(),
                devotionalService.getDevotionals(),
            ]);
            setToday(resToday.data);
            setDevotionals(resAll.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const shareVerse = (verse) => {
        const text = `"${verse.text}" - ${verse.reference}`;
        if (navigator.share) {
            navigator.share({ text });
        } else {
            navigator.clipboard.writeText(text);
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            {today && (
                <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">✝️</span>
                        <p className="text-sm font-bold uppercase tracking-wide">Verse of the Day</p>
                    </div>
                    <p className="text-xl font-serif italic mb-4 leading-relaxed">"{today.content?.split('\n\n')[0]}"</p>
                    <div className="flex justify-between items-center">
                        <p className="text-white/90 font-medium">— {today.verse}</p>
                    </div>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-800">Daily Devotionals</h1>
            
            {!selected && (
                <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl p-6 text-white">
                    <p className="text-sm font-medium opacity-80 mb-2">Today's Devotional</p>
                    <h2 className="text-2xl font-bold mb-3">{today?.title}</h2>
                    <p className="text-white/90 mb-4 line-clamp-3">{today?.content?.split('\n\n').slice(1).join('\n\n')}</p>
                    <p className="text-purple-200 font-medium">📖 {today?.verse}</p>
                </div>
            )}

            {selected && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <button onClick={() => setSelected(null)} className="text-purple-600 font-medium mb-4">← Back</button>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{selected.title}</h2>
                    <p className="text-gray-600 mb-4 whitespace-pre-line">{selected.content}</p>
                    <p className="text-purple-600 font-medium">📖 {selected.verse}</p>
                    <p className="text-gray-500 text-sm mt-2">{new Date(selected.devotional_date).toLocaleDateString()}</p>
                </div>
            )}

            {!selected && (
                <div className="grid gap-4">
                    {devotionals.map(d => (
                        <div key={d.id} onClick={() => setSelected(d)} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-800">{d.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{d.content.substring(0, 100)}...</p>
                                    <p className="text-purple-600 text-sm mt-2">{d.verse}</p>
                                </div>
                                <span className="text-xs text-gray-400">{new Date(d.devotional_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}