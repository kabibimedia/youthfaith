import { useState, useEffect } from 'react';
import { duesService } from '../../services/api';

const STATUS_BADGE = {
    active: 'bg-green-100 text-green-700',
    fulfilled: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-500',
};

export default function PledgesModal({ onClose }) {
    const [pledges, setPledges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPledges();
    }, []);

    const loadPledges = () => {
        duesService.getPledges()
            .then(res => setPledges(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await duesService.createPledge({ title, amount, due_date: dueDate || null });
            setShowForm(false);
            setTitle('');
            setAmount('');
            setDueDate('');
            loadPledges();
        } catch {} finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this pledge?')) return;
        try {
            await duesService.cancelPledge(id);
            loadPledges();
        } catch {}
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">🤝 My Pledges</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading...</div>
                    ) : pledges.length === 0 && !showForm ? (
                        <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">No pledges yet</p>
                            <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                                + Create Pledge
                            </button>
                        </div>
                    ) : (
                        <>
                            {pledges.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                                    <div>
                                        <div className="text-sm font-medium text-gray-800">{p.title}</div>
                                        <div className="text-xs text-gray-400">Due: {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'Flexible'}</div>
                                    </div>
                                    <div className="text-right flex items-center gap-2">
                                        <div>
                                            <div className="text-sm font-bold text-gray-800">₵{parseFloat(p.amount).toFixed(2)}</div>
                                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                                        </div>
                                        {p.status === 'active' && (
                                            <button onClick={() => handleCancel(p.id)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {!showForm && (
                                <button onClick={() => setShowForm(true)}
                                    className="w-full py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                                    + New Pledge
                                </button>
                            )}
                        </>
                    )}

                    {showForm && (
                        <form onSubmit={handleCreate} className="bg-purple-50 rounded-xl p-4 space-y-3 mt-2">
                            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Pledge title (e.g. Building Fund)"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="Amount"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="Due date"
                                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Create Pledge'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-gray-500 hover:bg-white rounded-lg text-sm">Cancel</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
