import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import AdminPanel from './AdminPanel';

const ROLES = ['President', 'Vice President', 'Secretary', 'Treasurer', 'Organiser', 'Prayer Coordinator', 'Media Lead', 'Worship Lead', 'Outreach Lead', 'Discipleship Lead', 'Admin'];

export default function UsersPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => { loadUsers(); }, [page, search]);

    const loadUsers = async () => {
        try {
            const res = await adminService.getUsers({ page, search });
            setUsers(res.data.data || res.data);
            setPagination(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await adminService.deleteUser(id);
            loadUsers();
        } catch {
            alert('Failed to delete user');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateUser(editingUser.id, editingUser);
            setEditingUser(null);
            loadUsers();
        } catch {
            alert('Failed to update user');
        }
    };

    if (loading) {
        return (
            <AdminPanel title="Users Management">
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </AdminPanel>
        );
    }

    return (
        <AdminPanel
            title={`Users (${pagination?.total || users.length})`}
            search={search}
            onSearch={(e) => { setSearch(e.target.value); setPage(1); }}
            searchPlaceholder="Search users..."
        >
            <div className="overflow-x-auto -mx-5">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">User</th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Position</th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Points</th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Access</th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Joined</th>
                            <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => (
                            <tr key={user.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-purple-50/50 transition-colors`}>
                                <td className="py-3.5 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3.5 px-5">
                                    <span className="text-sm text-gray-500">{user.email}</span>
                                </td>
                                <td className="py-3.5 px-5">
                                    {user.position ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">{user.position}</span>
                                    ) : (
                                        <span className="text-sm text-gray-300">—</span>
                                    )}
                                </td>
                                <td className="py-3.5 px-5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium">
                                        ⭐ {user.points || 0}
                                    </span>
                                </td>
                                <td className="py-3.5 px-5">
                                    {user.role === 'super_admin' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">👑 Super Admin</span>
                                    ) : user.role === 'admin' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium">🔑 Admin</span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">User</span>
                                    )}
                                </td>
                                <td className="py-3.5 px-5 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString()}</td>
                                <td className="py-3.5 px-5">
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingUser(user)} className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(user.id)} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination?.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-5">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                page === i + 1
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}

            {editingUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Edit User</h3>
                        <p className="text-xs text-gray-400 mb-5">Update user details and permissions</p>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Name</label>
                                <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                                <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Points</label>
                                <input type="number" value={editingUser.points} onChange={(e) => setEditingUser({ ...editingUser, points: parseInt(e.target.value) })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            {editingUser.registration_photo && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Registration Photo</label>
                                    <img src={editingUser.registration_photo} alt="Registration" className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200" />
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Position</label>
                                <select value={editingUser.position || ''} onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option value="">No Role</option>
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Access:</span>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${editingUser.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : editingUser.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {editingUser.role === 'super_admin' ? '👑 Super Admin' : editingUser.role === 'admin' ? '🔑 Admin' : 'User'}
                                </span>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminPanel>
    );
}
