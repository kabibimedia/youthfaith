import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/api';
import AdminPanel from './AdminPanel';

function PhotoPreview({ src, onClose }) {
    if (!src) return null;
    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <img src={src} alt="Registration photo" className="w-full rounded-2xl shadow-2xl" />
                <button onClick={onClose} className="mt-3 w-full py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm font-medium">
                    Close
                </button>
            </div>
        </div>
    );
}

export default function ClientsPanel() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [importError, setImportError] = useState('');
    const importFileRef = useRef(null);
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        loadClients();
    }, [page, search]);

    const handleImport = async (e) => {
        e.preventDefault();
        if (!importFile) return;
        setImporting(true);
        setImportError('');
        setImportResult(null);
        const fd = new FormData();
        fd.append('type', 'clients');
        fd.append('file', importFile);
        try {
            const res = await adminService.uploadFile(fd);
            setImportResult(res.data);
            setImportFile(null);
            if (importFileRef.current) importFileRef.current.value = '';
            loadClients();
        } catch (err) {
            setImportError(err.response?.data?.message || 'Import failed');
        } finally {
            setImporting(false);
        }
    };

    const handleDownload = async (format) => {
        setShowDownloadMenu(false);
        setDownloading(true);
        try {
            const res = await adminService.downloadClients({ search: search || undefined, format });
            const ext = format === 'pdf' ? 'pdf' : 'csv';
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `clients-${new Date().toISOString().split('T')[0]}.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed', err);
        } finally { setDownloading(false); }
    };

    const loadClients = async () => {
        setLoading(true);
        try {
            const res = await adminService.getClients({ page, search });
            setClients(res.data.data || []);
            setPagination(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const withDues = clients.filter(c => c.has_dues_card).length;
    const totalAmount = clients.reduce((sum, c) => sum + parseFloat(c.total_paid || 0), 0);

    if (loading) {
        return (
            <AdminPanel title="Client List">
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
                    ))}
                </div>
            </AdminPanel>
        );
    }

    const actionBtn = (
        <div className="flex items-center gap-2">
            <button onClick={() => setShowImport(true)}
                className="px-3 py-2 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5">
                <span>📥</span> Upload CSV
            </button>
            <div className="relative">
                <button onClick={() => setShowDownloadMenu(!showDownloadMenu)} disabled={downloading}
                    className="px-3 py-2 text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50">
                    <span>⬇</span> {downloading ? 'Downloading...' : 'Download'}
                </button>
                {showDownloadMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDownloadMenu(false)} />
                        <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 min-w-[140px]">
                            <button onClick={() => handleDownload('csv')}
                                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">📄 CSV</button>
                            <button onClick={() => handleDownload('pdf')}
                                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">📑 PDF</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <AdminPanel
            title={`Clients (${pagination?.total || clients.length})`}
            search={search}
            onSearch={(e) => { setSearch(e.target.value); setPage(1); }}
            searchPlaceholder="Search by name, email or card..."
            action={actionBtn}
        >
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-4 border border-purple-100">
                    <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{pagination?.total || clients.length}</p>
                    <p className="text-[10px] text-purple-400 mt-0.5">registered members</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">With Dues Card</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{withDues}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">{((withDues / (clients.length || 1)) * 100).toFixed(0)}% of clients</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl p-4 border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">With Role</p>
                    <p className="text-2xl font-bold text-amber-900 mt-1">{clients.filter(c => c.role).length}</p>
                    <p className="text-[10px] text-amber-400 mt-0.5">assigned a position</p>
                </div>
            </div>

            {clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-2xl mb-4">
                        👤
                    </div>
                    <p className="text-gray-500 font-medium">No clients found</p>
                    <p className="text-gray-400 text-sm mt-1">{search ? 'Try a different search term' : 'Import clients via CSV to get started'}</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-5">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Client</th>
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Email</th>
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Username</th>
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Photo</th>
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Dues Card</th>
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Location</th>
                                <th className="text-left py-3 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Member Since</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client, i) => {
                                const fullName = client.surname
                                    ? [client.surname, client.firstname, client.othername].filter(Boolean).join(' ')
                                    : client.name;
                                return (
                                    <tr key={client.id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-purple-50/50 transition-colors`}>
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                {client.registration_photo ? (
                                                    <button onClick={() => setPreviewPhoto(client.registration_photo)} className="shrink-0">
                                                        <img src={client.registration_photo} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                                                    </button>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0">
                                                        {fullName?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-medium text-gray-800 text-sm">{fullName}</span>
                                                    {client.role && (
                                                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md ml-2 font-medium">{client.role}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-gray-500">{client.email}</td>
                                        <td className="py-3.5 px-5 text-sm text-gray-500">@{client.username}</td>
                                        <td className="py-3.5 px-5">
                                            {client.registration_photo ? (
                                                <button onClick={() => setPreviewPhoto(client.registration_photo)} className="group relative">
                                                    <img src={client.registration_photo} alt="" className="w-10 h-10 rounded-xl object-cover border border-gray-200" />
                                                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-[10px] font-medium">View</span>
                                                    </div>
                                                </button>
                                            ) : (
                                                <span className="text-sm text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-5">
                                            {client.has_dues_card ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-mono font-medium shadow-sm">
                                                    {client.dues_card_code}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-5 text-sm text-gray-400">{client.location || <span className="text-gray-300">—</span>}</td>
                                        <td className="py-3.5 px-5 text-sm text-gray-400">
                                            {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {previewPhoto && <PhotoPreview src={previewPhoto} onClose={() => setPreviewPhoto(null)} />}

            {showImport && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowImport(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-lg font-bold text-gray-900">Upload Clients</h3>
                            <button onClick={() => { setShowImport(false); setImportResult(null); setImportError(''); setImportFile(null); }}
                                className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                        </div>
                        <p className="text-xs text-gray-400 mb-5">Import multiple clients from a CSV file</p>
                        <form onSubmit={handleImport} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-purple-300 transition-colors">
                                {importFile ? (
                                    <div>
                                        <div className="text-3xl mb-2">📄</div>
                                        <div className="font-medium text-gray-800 text-sm">{importFile.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{(importFile.size / 1024).toFixed(1)} KB</div>
                                        <button type="button" onClick={() => { setImportFile(null); if (importFileRef.current) importFileRef.current.value = ''; }}
                                            className="mt-2 text-xs text-red-500 hover:text-red-600 font-medium">Remove</button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-3xl mb-2">📂</div>
                                        <div className="text-gray-600 mb-2 text-sm">Upload a CSV file to add clients</div>
                                        <label className="inline-block px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg cursor-pointer text-sm font-medium transition-all">
                                            Browse
                                            <input ref={importFileRef} type="file" accept=".csv,.txt" onChange={(e) => setImportFile(e.target.files[0])} className="hidden" />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-400">
                                Expected columns: <code className="text-purple-600 font-medium">surname, firstname, othername, email, username, date_of_birth, location</code>
                            </div>
                            {importError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{importError}</div>
                            )}
                            {importResult && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <div className="text-sm text-emerald-700 font-medium">✓ {importResult.imported} clients uploaded</div>
                                    {importResult.errors?.length > 0 && (
                                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                            {importResult.errors.map((err, i) => (
                                                <div key={i} className="text-xs text-red-600">{err}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 pt-1">
                                <button type="button" onClick={() => { setShowImport(false); setImportResult(null); setImportError(''); setImportFile(null); }}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" disabled={!importFile || importing}
                                    className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
                                    {importing ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {pagination?.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)}
                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                                page === i + 1
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>{i + 1}</button>
                    ))}
                </div>
            )}
        </AdminPanel>
    );
}