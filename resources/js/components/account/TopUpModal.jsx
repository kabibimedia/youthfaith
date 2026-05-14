import { useState } from 'react';
import { duesService } from '../../services/api';

const PAYMENT_METHODS = ['', 'Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Other'];

export default function TopUpModal({ onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('dues');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [periodCoverage, setPeriodCoverage] = useState('');
    const [proof, setProof] = useState(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!proof) {
            setError('Please upload proof of payment');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('amount', amount);
            fd.append('type', type);
            if (paymentMethod) fd.append('payment_method', paymentMethod);
            if (referenceNumber) fd.append('reference_number', referenceNumber);
            if (periodCoverage) fd.append('period_coverage', periodCoverage);
            fd.append('proof', proof);
            if (notes) fd.append('notes', notes);
            await duesService.pay(fd);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">💳 Top Up</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">⚠️ {error}</div>}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₵) *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₵</span>
                            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required
                                placeholder="0.00" className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50">
                            <option value="dues">Dues</option>
                            <option value="contribution">Contribution</option>
                            <option value="pledge">Pledge</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 text-sm">
                                {PAYMENT_METHODS.map(m => (
                                    <option key={m} value={m}>{m || 'Select...'}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ref/Receipt #</label>
                            <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="MOMO ref, bank ref..."
                                className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Period / Coverage</label>
                        <input type="text" value={periodCoverage} onChange={(e) => setPeriodCoverage(e.target.value)}
                            placeholder="e.g. May 2026, Q2 2026"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Proof of Payment *</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-300 transition-colors cursor-pointer"
                            onClick={() => document.getElementById('proof-input').click()}>
                            {proof ? (
                                <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-medium">✅ {proof.name}</div>
                            ) : (
                                <div className="text-sm text-gray-400">Tap to upload receipt (image or PDF)</div>
                            )}
                        </div>
                        <input id="proof-input" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setProof(e.target.files[0])} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                            placeholder="Any additional info..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50/50 resize-none text-sm" />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 transition-all">
                        {loading ? 'Submitting...' : 'Submit for Approval'}
                    </button>
                </form>
            </div>
        </div>
    );
}
