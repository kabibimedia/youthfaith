import { useState, useEffect, useRef } from 'react';
import { adminSliderService } from '../../services/api';

function SlideEditor({ slider, onSave, onCancel }) {
    const [title, setTitle] = useState(slider?.title || '');
    const [subtitle, setSubtitle] = useState(slider?.subtitle || '');
    const [linkUrl, setLinkUrl] = useState(slider?.link_url || '');
    const [startDate, setStartDate] = useState(slider?.start_date || '');
    const [endDate, setEndDate] = useState(slider?.end_date || '');
    const [sortOrder, setSortOrder] = useState(slider?.sort_order ?? 0);
    const [isActive, setIsActive] = useState(slider?.is_active ?? true);
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('subtitle', subtitle);
            fd.append('link_url', linkUrl);
            fd.append('start_date', startDate);
            fd.append('end_date', endDate);
            fd.append('sort_order', String(sortOrder));
            fd.append('is_active', isActive ? '1' : '0');
            if (imageFile) fd.append('image', imageFile);
            const res = await adminSliderService.updateSlider(slider.id, fd);
            onSave(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Save failed';
            const errs = err.response?.data?.errors;
            const detail = errs ? Object.values(errs).flat().join(', ') : '';
            setError(detail || msg);
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full p-3 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                    <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Image (leave empty to keep)</label>
                    <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-2 border rounded-lg" />
                </div>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
            <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={onCancel} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
            </div>
        </form>
    );
}

export default function SlidersPanel() {
    const [sliders, setSliders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bulkFiles, setBulkFiles] = useState([]);
    const [bulkPreviews, setBulkPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadSliders();
    }, []);

    const loadSliders = async () => {
        try {
            const res = await adminSliderService.getSliders();
            setSliders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setBulkFiles(files);
        setBulkPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const handleBulkUpload = async () => {
        if (bulkFiles.length === 0) return;
        setUploading(true);
        try {
            const fd = new FormData();
            bulkFiles.forEach((file) => fd.append('images[]', file));
            await adminSliderService.bulkUpload(fd);
            setBulkFiles([]);
            setBulkPreviews([]);
            loadSliders();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this slide?')) return;
        try {
            await adminSliderService.deleteSlider(id);
            setSliders((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleActive = async (slider) => {
        const fd = new FormData();
        fd.append('is_active', slider.is_active ? '0' : '1');
        try {
            const res = await adminSliderService.updateSlider(slider.id, fd);
            setSliders((prev) => prev.map((s) => (s.id === slider.id ? res.data : s)));
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditSave = (updated) => {
        setSliders((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setEditingId(null);
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Hero Slider Images</h2>

            {/* Bulk Upload */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
                <label className="block text-sm font-medium text-gray-700 mb-3">Upload Images</label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4" />

                {bulkPreviews.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-3 mb-3">
                            {bulkPreviews.map((src, i) => (
                                <div key={i} className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100">
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">{bulkFiles.length} image(s) selected</p>
                        <button onClick={handleBulkUpload} disabled={uploading} className="mt-3 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                            {uploading ? 'Uploading...' : `Upload ${bulkFiles.length > 0 ? `(${bulkFiles.length})` : ''}`}
                        </button>
                    </div>
                )}

                {bulkFiles.length === 0 && (
                    <p className="text-xs text-gray-400">Select multiple images to upload. They will display one after another in the hero slider.</p>
                )}
            </div>

            {/* Current Slides */}
            <h3 className="text-md font-medium text-gray-700">Current Slides</h3>
            {sliders.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border">
                    No slides yet. Upload images above to get started.
                </div>
            ) : (
                <div className="space-y-3">
                    {sliders.map((slider) => (
                        <div key={slider.id}>
                            <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4">
                                <img src={slider.image} alt="" className="w-28 h-20 rounded-lg object-cover shrink-0 bg-gray-100" />
                                <div className="flex-1 min-w-0">
                                    {slider.title && <p className="font-medium text-gray-800 truncate text-sm">{slider.title}</p>}
                                    <p className="text-xs text-gray-400">
                                        Order: {slider.sort_order} · {slider.is_active ? 'Active' : 'Inactive'}
                                        {slider.start_date && ` · Starts: ${slider.start_date}`}
                                        {slider.end_date && ` · Ends: ${slider.end_date}`}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => handleToggleActive(slider)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${slider.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                        {slider.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                    <button onClick={() => setEditingId(slider.id)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100">Edit</button>
                                    <button onClick={() => handleDelete(slider.id)} className="px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100">Delete</button>
                                </div>
                            </div>
                            {editingId === slider.id && (
                                <div className="mt-3">
                                    <SlideEditor
                                        slider={slider}
                                        onSave={handleEditSave}
                                        onCancel={() => setEditingId(null)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
