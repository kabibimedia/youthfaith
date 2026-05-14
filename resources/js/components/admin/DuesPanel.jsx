import { useState, useEffect } from 'react';
import { adminDuesService } from '../../services/api';

const STATUS_BADGE = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
};

const TYPE_ICON = {
    dues: '📅',
    contribution: '🎁',
    pledge: '🤝',
};

export default function DuesPanel() {
    const [tab, setTab] = useState('payments');
    const [payments, setPayments] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [showCodes, setShowCodes] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        if (tab === 'payments') loadPayments();
        if (tab === 'members') loadMembers();
    }, [tab, filter]);

    const loadPayments = async () => {
        setLoading(true);
        try {
            const res = await adminDuesService.getPayments({ status: filter || undefined });
            setPayments(res.data.data || []);
        } catch {} finally { setLoading(false); }
    };

    const loadMembers = async () => {
        setLoading(true);
        try {
            const res = await adminDuesService.getMembers({ search: filter || undefined });
            setMembers(res.data.data || []);
        } catch {} finally { setLoading(false); }
    };

    const handleApprove = async (id) => {
        try {
            await adminDuesService.approvePayment(id);
            loadPayments();
        } catch { alert('Failed to approve'); }
    };

    const handleReject = async (id) => {
        const notes = prompt('Reason for rejection (optional):');
        try {
            await adminDuesService.rejectPayment(id, notes);
            loadPayments();
        } catch { alert('Failed to reject'); }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <button onClick={() => setTab('payments')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            tab === 'payments' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}>💳 Payments</button>
                    <button onClick={() => setTab('members')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            tab === 'members' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
                        }`}>👥 Members</button>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowUpload(true)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all">
                        + Upload Payment
                    </button>
                    <button onClick={() => setShowCodes(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                        Generate Codes
                    </button>
                </div>
            </div>

            <input type="text" placeholder={tab === 'payments' ? 'Filter by status (pending, approved, rejected)...' : 'Search by name or card code...'}
                value={filter} onChange={(e) => setFilter(e.target.value)}
                className="w-full mb-4 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent" />

            {loading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : tab === 'payments' ? (
                <div className="space-y-2">
                    {payments.length === 0 && <p className="text-center py-8 text-gray-400">No payments found</p>}
                    {payments.map(p => (
                        <div key={p.id} onClick={() => setSelectedPayment(p)} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200 text-sm">
                                    {TYPE_ICON[p.type]}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-800">{p.user?.name || 'Unknown'}</div>
                                    <div className="text-xs text-gray-400">{p.user?.dues_card_code} · {new Date(p.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-800">₵{parseFloat(p.amount).toFixed(2)}</div>
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                                </div>
                                {p.status === 'pending' && (
                                    <div className="flex gap-1">
                                        <button onClick={() => handleApprove(p.id)} className="px-2.5 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">✓</button>
                                        <button onClick={() => handleReject(p.id)} className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">✕</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {members.length === 0 && <p className="text-center py-8 text-gray-400">No members found</p>}
                    {members.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                    {m.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-800">{m.name}</div>
                                    <div className="text-xs text-gray-400">
                                        Card: {m.dues_card_code || '—'} · {m.is_member ? 'Member' : 'Non-member'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-600">₵{parseFloat(m.total_paid || 0).toFixed(2)}</div>
                                <div className="text-xs text-gray-400">paid</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showUpload && <UploadPaymentModal onClose={() => setShowUpload(false)} onSuccess={() => { setShowUpload(false); loadPayments(); }} />}
            {showCodes && <GenerateCodesModal onClose={() => setShowCodes(false)} />}
            {selectedPayment && <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} onApprove={handleApprove} onReject={handleReject} />}
        </div>
    );
}

const PROOF_BASE = '/storage/';

function PaymentDetailModal({ payment, onClose, onApprove, onReject }) {
    if (!payment) return null;
    const isPending = payment.status === 'pending';

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-800">Payment Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                            {payment.user?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">{payment.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-400">Card: {payment.user?.dues_card_code || '—'}</div>
                        </div>
                        <div className="ml-auto">
                            <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${STATUS_BADGE[payment.status]}`}>{payment.status}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <DetailField label="Amount" value={`₵${parseFloat(payment.amount).toFixed(2)}`} highlight />
                        <DetailField label="Type" value={payment.type} />
                        <DetailField label="Payment Method" value={payment.payment_method || '—'} />
                        <DetailField label="Reference #" value={payment.reference_number || '—'} />
                        <DetailField label="Period Coverage" value={payment.period_coverage || '—'} />
                        <DetailField label="Date" value={new Date(payment.created_at).toLocaleDateString()} />
                    </div>

                    {payment.notes && (
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
                            <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{payment.notes}</p>
                        </div>
                    )}

                    {payment.proof_path && (
                        <div>
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Proof Document</label>
                            <a href={`${PROOF_BASE}${payment.proof_path}`} target="_blank" rel="noopener noreferrer"
                                className="mt-1 flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm bg-purple-50 rounded-lg p-3">
                                <span>📎</span> View Proof
                            </a>
                        </div>
                    )}

                    {payment.admin && (
                        <div className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                            Processed by {payment.admin.name} on {new Date(payment.updated_at).toLocaleDateString()}
                        </div>
                    )}

                    {isPending && (
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => { onApprove(payment.id); onClose(); }}
                                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all">
                                ✓ Approve
                            </button>
                            <button onClick={() => { onReject(payment.id); onClose(); }}
                                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all">
                                ✕ Reject
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DetailField({ label, value, highlight }) {
    return (
        <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
            <p className={`mt-0.5 text-sm ${highlight ? 'text-xl font-bold text-gray-900' : 'text-gray-700'}`}>{value}</p>
        </div>
    );
}

const PAYMENT_METHODS = ['', 'Cash', 'Mobile Money', 'Bank Transfer', 'Cheque', 'Other'];

function UploadPaymentModal({ onClose, onSuccess }) {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('dues');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [periodCoverage, setPeriodCoverage] = useState('');
    const [proof, setProof] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('user_id', userId);
            fd.append('amount', amount);
            fd.append('type', type);
            if (paymentMethod) fd.append('payment_method', paymentMethod);
            if (referenceNumber) fd.append('reference_number', referenceNumber);
            if (periodCoverage) fd.append('period_coverage', periodCoverage);
            if (proof) fd.append('proof', proof);
            await adminDuesService.uploadPayment(fd);
            onSuccess();
        } catch { alert('Upload failed'); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Upload Payment</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} required placeholder="User ID"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                    <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="Amount"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                    <div className="grid grid-cols-2 gap-2">
                        <select value={type} onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500">
                            <option value="dues">Dues</option>
                            <option value="contribution">Contribution</option>
                            <option value="pledge">Pledge</option>
                        </select>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500">
                            {PAYMENT_METHODS.map(m => (
                                <option key={m} value={m}>{m || 'Method...'}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Ref/Receipt #"
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                        <input type="text" value={periodCoverage} onChange={(e) => setPeriodCoverage(e.target.value)} placeholder="Period (e.g. May 2026)"
                            className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center text-sm text-gray-400 cursor-pointer hover:border-purple-300"
                        onClick={() => document.getElementById('admin-proof').click()}>
                        {proof ? `✅ ${proof.name}` : 'Upload proof (optional)'}
                    </div>
                    <input id="admin-proof" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setProof(e.target.files[0])} />
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl disabled:opacity-50">
                        {loading ? 'Uploading...' : 'Save Payment'}
                    </button>
                </form>
            </div>
        </div>
    );
}

function GenerateCodesModal({ onClose }) {
    const [count, setCount] = useState(10);
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await adminDuesService.generateCodes(count);
            setCodes(res.data.codes);
        } catch { alert('Failed to generate'); } finally { setLoading(false); }
    };

    const copyAll = () => {
        navigator.clipboard.writeText(codes.join('\n'));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Generate Card Codes</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                </div>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-gray-600">Number of codes</label>
                        <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)}
                            className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500" />
                    </div>
                    <button onClick={handleGenerate} disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl disabled:opacity-50">
                        {loading ? 'Generating...' : 'Generate'}
                    </button>
                    {codes.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-500">{codes.length} codes generated</span>
                                <button onClick={copyAll} className="text-xs text-purple-600 hover:text-purple-700 font-medium">Copy all</button>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto grid grid-cols-5 gap-2">
                                {codes.map((c, i) => (
                                    <div key={i} className="bg-white rounded-lg px-2 py-1.5 text-center text-sm font-mono font-bold text-gray-700 border border-gray-200">{c}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
