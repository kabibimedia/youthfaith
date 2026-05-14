import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { duesService } from '../../services/api';
import TopUpModal from './TopUpModal';
import StatementModal from './StatementModal';
import PledgesModal from './PledgesModal';

export default function AccountPanel({ onNavClick }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTopUp, setShowTopUp] = useState(false);
    const [showStatement, setShowStatement] = useState(false);
    const [showPledges, setShowPledges] = useState(false);
    const panelRef = useRef(null);

    useEffect(() => {
        if (user) {
            loadOverview();
        }
    }, [user]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setExpanded(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadOverview = async () => {
        try {
            const res = await duesService.overview();
            setData(res.data);
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/welcome');
    };

    const closeAll = () => {
        setShowTopUp(false);
        setShowStatement(false);
        setShowPledges(false);
    };

    return (
        <>
            <div ref={panelRef} className="mb-3">
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-200 transition-all text-left"
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800 truncate">{user?.name}</div>
                        <div className="text-xs text-gray-400 truncate">{user?.role ? `${user.role} · ` : ''}Card: {data?.card_code || '—'}</div>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {expanded && (
                    <div className="mt-2 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3 animate-fadeIn">
                        {loading ? (
                            <div className="text-center py-3 text-sm text-gray-400">Loading...</div>
                        ) : data ? (
                            <>
                                <div className="text-center">
                                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 rounded-full text-xs font-medium text-purple-700">
                                        💳 Dues · {data.card_code}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-green-600">₵{data.total_paid?.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">Total Paid</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 text-center">
                                        <div className="text-lg font-bold text-amber-600">₵{data.active_pledges_total?.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500">Pledges</div>
                                    </div>
                                </div>
                                {data.last_paid_at && (
                                    <div className="bg-blue-50 rounded-lg p-2.5 flex items-center justify-between text-sm">
                                        <span className="text-blue-600 font-medium">Last paid</span>
                                        <span className="text-blue-800 font-bold">₵{data.last_paid_amount?.toFixed(2)} · {new Date(data.last_paid_at).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {data.pending_amount > 0 && (
                                    <div className="bg-amber-50 rounded-lg p-2.5 text-center text-sm text-amber-700 font-medium">
                                        ⏳ ₵{data.pending_amount.toFixed(2)} pending approval
                                    </div>
                                )}
                            </>
                        ) : null}

                        <div className="flex items-center gap-2 pt-1 pb-1">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">💳 Dues</span>
                            <div className="flex-1 border-t border-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <button onClick={() => { setExpanded(false); setShowStatement(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-purple-600 transition-all">
                                📄 Statement
                            </button>
                            <button onClick={() => { setExpanded(false); setShowTopUp(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-purple-600 transition-all">
                                💳 Top Up
                            </button>
                            <button onClick={() => { setExpanded(false); setShowPledges(true); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white hover:text-purple-600 transition-all">
                                🤝 My Pledges
                            </button>
                            <hr className="border-gray-200" />
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showTopUp && createPortal(<TopUpModal onClose={() => setShowTopUp(false)} onSuccess={closeAll} />, document.body)}
            {showStatement && createPortal(<StatementModal onClose={() => setShowStatement(false)} />, document.body)}
            {showPledges && createPortal(<PledgesModal onClose={() => setShowPledges(false)} />, document.body)}
        </>
    );
}
