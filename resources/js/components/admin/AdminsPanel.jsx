import { useState, useEffect } from 'react';
import { superAdminService } from '../../services/api';

export default function AdminsPanel() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const res = await superAdminService.getAdmins();
            setAdmins(res.data.data || []);
        } catch {} finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleRoleChange = async (user, role) => {
        if (!confirm(`Change ${user.name} to ${role}?`)) return;
        try {
            await superAdminService.updateAdminRole(user.id, role);
            load();
        } catch { alert('Failed to update role'); }
    };

    const handleDelete = async (user) => {
        if (!confirm(`Demote ${user.name} to regular user?`)) return;
        try {
            await superAdminService.deleteAdmin(user.id);
            load();
        } catch { alert('Failed to demote admin'); }
    };

    if (loading) return <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>;

    return (
        <div className="space-y-2">
            {admins.length === 0 && <p className="text-center py-8 text-gray-400">No admins found</p>}
            {admins.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">{a.name?.charAt(0)}</div>
                        <div>
                            <div className="text-sm font-medium text-gray-800">{a.name}</div>
                            <div className="text-xs text-gray-400">{a.email} · {a.role === 'super_admin' ? '👑 Super Admin' : 'Admin'}</div>
                        </div>
                    </div>
                    {a.role === 'super_admin' ? (
                        <span className="text-xs text-amber-600 font-medium">Protected</span>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => handleRoleChange(a, 'user')} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-all">Demote</button>
                            <button onClick={() => handleDelete(a)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all">Remove</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
