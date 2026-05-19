import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/api';

export default function ActivityLogsPanel() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const params = {};
            if (actionFilter) params.action = actionFilter;
            const res = await superAdminService.getActivityLogs(params);
            setLogs(res.data.data || []);
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [actionFilter]);

    const ACTION_LABELS = {
        dues_payment_approved: 'Approved Payment',
        dues_payment_rejected: 'Rejected Payment',
        dues_payment_uploaded: 'Uploaded Payment',
        dues_codes_generated: 'Generated Codes',
        card_request_approved: 'Approved Card Request',
        card_request_rejected: 'Rejected Card Request',
        user_card_verified: 'Verified User Card',
        admin_role_updated: 'Updated Admin Role',
        admin_demoted: 'Demoted Admin',
        super_admin_promoted: 'Promoted to Super Admin',
    };

    return (
        <div>
            <div className="mb-4">
                <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="">All Actions</option>
                    {Object.entries(ACTION_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
            ) : logs.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No activity logs</p>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => (
                        <div key={log.id} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{log.user?.name?.charAt(0) || '?'}</div>
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-800">{ACTION_LABELS[log.action] || log.action}</div>
                                {log.details && <div className="text-xs text-gray-500 mt-0.5">{log.details}</div>}
                                <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-x-3">
                                    <span>by {log.user?.name || 'Unknown'}</span>
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                    {log.ip_address && <span className="font-mono">{log.ip_address}</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
