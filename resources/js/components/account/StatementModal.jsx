import { useState, useEffect } from 'react';
import { duesService } from '../../services/api';

const STATUS_BADGE = {
    approved: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
};

const TYPE_LABEL = {
    dues: '📅 Dues',
    contribution: '🎁 Contribution',
    pledge: '🤝 Pledge',
};

export default function StatementModal({ onClose }) {
    const [payments, setPayments] = useState([]);
    const [total, setTotal] = useState(0);
    const [lastPaid, setLastPaid] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            duesService.getStatement(),
            duesService.overview(),
        ]).then(([stmtRes, ovRes]) => {
            setPayments(stmtRes.data.payments || []);
            setTotal(stmtRes.data.total || 0);
            if (ovRes.data.last_paid_at) {
                setLastPaid({ date: ovRes.data.last_paid_at, amount: ovRes.data.last_paid_amount });
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start sm:items-center justify-between mb-4 gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">📄 Payment Statement</h2>
                        <p className="text-sm text-gray-400 mt-0.5">
                            Total Paid: <span className="font-bold text-green-600">₵{total.toFixed(2)}</span>
                            {lastPaid && (
                                <span className="ml-2">· Last: <span className="font-bold text-blue-600">₵{lastPaid.amount.toFixed(2)}</span>
                                <span className="text-gray-400 ml-1">{new Date(lastPaid.date).toLocaleDateString()}</span></span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {payments.length > 0 && (
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await duesService.downloadStatementPdf();
                                        const url = URL.createObjectURL(new Blob([res.data]));
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `statement-${new Date().toISOString().split('T')[0]}.pdf`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    } catch (err) { console.error(err); }
                                }}
                                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 flex items-center gap-1"
                            >
                                ⬇ PDF
                            </button>
                        )}
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">Loading...</div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3">📭</div>
                            <p className="text-gray-400">No payments recorded yet</p>
                            <p className="text-xs text-gray-300 mt-1">Top up using the button in your account panel</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm whitespace-nowrap">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-2.5 px-2 text-gray-500 font-medium">#</th>
                                        <th className="text-left py-2.5 px-2 text-gray-500 font-medium">Date</th>
                                        <th className="text-left py-2.5 px-2 text-gray-500 font-medium">Type</th>
                                        <th className="text-left py-2.5 px-2 text-gray-500 font-medium">Reference</th>
                                        <th className="text-left py-2.5 px-2 text-gray-500 font-medium">Period</th>
                                        <th className="text-left py-2.5 px-2 text-gray-500 font-medium">Method</th>
                                        <th className="text-right py-2.5 px-2 text-gray-500 font-medium">Amount</th>
                                        <th className="text-right py-2.5 px-2 text-gray-500 font-medium">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((p, i) => (
                                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-2.5 px-2 text-gray-400">{i + 1}</td>
                                            <td className="py-2.5 px-2 text-gray-800">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="py-2.5 px-2">
                                                <span className="text-xs">{TYPE_LABEL[p.type] || p.type}</span>
                                            </td>
                                            <td className="py-2.5 px-2 text-gray-600 font-mono text-xs">{p.reference_number || '—'}</td>
                                            <td className="py-2.5 px-2 text-gray-600 text-xs">{p.period_coverage || '—'}</td>
                                            <td className="py-2.5 px-2 text-gray-600 text-xs">{p.payment_method || '—'}</td>
                                            <td className="py-2.5 px-2 text-right font-medium text-gray-800">₵{parseFloat(p.amount).toFixed(2)}</td>
                                            <td className="py-2.5 px-2 text-right font-medium text-blue-600">₵{(p.running_balance || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="font-bold">
                                        <td colSpan="6" className="py-3 px-2 text-right text-gray-700">Total</td>
                                        <td className="py-3 px-2 text-right text-green-600">₵{total.toFixed(2)}</td>
                                        <td className="py-3 px-2 text-right text-blue-600">₵{total.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                {payments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                        <span>{payments.length} transaction{payments.length !== 1 ? 's' : ''}</span>
                        <span>Statement as of {new Date().toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
