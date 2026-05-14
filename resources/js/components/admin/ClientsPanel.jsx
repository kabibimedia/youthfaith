import { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/api';

function PhotoPreview({ src, onClose }) {
    if (!src) return null;
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                <img src={src} alt="Registration photo" className="w-full rounded-xl" />
                <button onClick={onClose} className="mt-3 w-full py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm">
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

    const handleExport = async () => {
        try {
            const res = await adminService.exportClients({ search: search || undefined });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed', err);
        }
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

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Client List</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowImport(true)}
                        className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1.5"
                    >
                        <span>📥</span> Import CSV
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                        <span>⬇</span> Export CSV
                    </button>
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Username</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Photo</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Dues Card</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Location</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Member Since</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-gray-400">No clients found</td>
                            </tr>
                        ) : (
                            clients.map(client => (
                                <tr key={client.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                                                {client.surname?.charAt(0).toUpperCase() || client.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-800">
                                                    {client.surname ? [client.surname, client.firstname, client.othername].filter(Boolean).join(' ') : client.name}
                                                </span>
                                                {client.role && (
                                                    <span className="text-xs text-purple-600 block">{client.role}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{client.email}</td>
                                    <td className="py-3 px-4 text-gray-600">@{client.username}</td>
                                    <td className="py-3 px-4">
                                        {client.registration_photo ? (
                                            <button onClick={() => setPreviewPhoto(client.registration_photo)} className="group relative">
                                                <img src={client.registration_photo} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-[10px] font-medium">View</span>
                                                </div>
                                            </button>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {client.has_dues_card ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-mono">
                                                {client.dues_card_code}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-sm">{client.location || '—'}</td>
                                    <td className="py-3 px-4 text-gray-500 text-sm">
                                        {new Date(client.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {previewPhoto && <PhotoPreview src={previewPhoto} onClose={() => setPreviewPhoto(null)} />}

            {showImport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Import Clients</h3>
                            <button onClick={() => { setShowImport(false); setImportResult(null); setImportError(''); setImportFile(null); }} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handleImport} className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                                {importFile ? (
                                    <div>
                                        <div className="text-3xl mb-2">📄</div>
                                        <div className="font-medium text-gray-800">{importFile.name}</div>
                                        <div className="text-sm text-gray-500">{(importFile.size / 1024).toFixed(1)} KB</div>
                                        <button type="button" onClick={() => { setImportFile(null); if (importFileRef.current) importFileRef.current.value = ''; }} className="mt-2 text-sm text-red-500 hover:text-red-600">Remove</button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="text-3xl mb-2">📂</div>
                                        <div className="text-gray-600 mb-2 text-sm">Upload a CSV file to import clients</div>
                                        <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer text-sm">
                                            Browse
                                            <input ref={importFileRef} type="file" accept=".csv,.txt" onChange={(e) => setImportFile(e.target.files[0])} className="hidden" />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="text-xs text-gray-500">
                                CSV headers: <code className="text-purple-600">surname, firstname, othername, email, username, date_of_birth, location</code>
                            </div>
                            {importError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{importError}</div>
                            )}
                            {importResult && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <div className="text-sm text-emerald-700 font-medium">✓ {importResult.imported} clients imported</div>
                                    {importResult.errors?.length > 0 && (
                                        <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                                            {importResult.errors.map((err, i) => (
                                                <div key={i} className="text-xs text-red-600">{err}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => { setShowImport(false); setImportResult(null); setImportError(''); setImportFile(null); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
                                <button type="submit" disabled={!importFile || importing} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm">
                                    {importing ? 'Importing...' : 'Import'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {pagination?.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.last_page }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={`px-3 py-1 rounded-lg ${
                                page === i + 1
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
