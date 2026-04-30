import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function EventsPanel() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        location: '',
        max_attendees: '',
    });

    useEffect(() => {
        loadEvents();
    }, [search]);

    const loadEvents = async () => {
        try {
            const res = await adminService.getEvents({ search });
            setEvents(res.data.data || res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                await adminService.updateEvent(editingEvent.id, formData);
            } else {
                await adminService.createEvent(formData);
            }
            setShowModal(false);
            setEditingEvent(null);
            setFormData({ title: '', description: '', event_date: '', location: '', max_attendees: '' });
            loadEvents();
        } catch (err) {
            alert('Failed to save event');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await adminService.deleteEvent(id);
            loadEvents();
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const openEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date?.split(' ')[0] || '',
            location: event.location || '',
            max_attendees: event.max_attendees || '',
        });
        setShowModal(true);
    };

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading...</div>;
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Events Management</h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        onClick={() => { setEditingEvent(null); setFormData({ title: '', description: '', event_date: '', location: '', max_attendees: '' }); setShowModal(true); }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        + Add Event
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {events.map(event => (
                    <div key={event.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-semibold text-gray-800 text-lg">{event.title}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => openEdit(event)} className="text-purple-600 hover:text-purple-700 text-sm">Edit</button>
                                <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
                            </div>
                        </div>
                        {event.description && <p className="text-gray-600 text-sm mb-3">{event.description}</p>}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>📅 {new Date(event.event_date).toLocaleDateString()}</span>
                            {event.location && <span>📍 {event.location}</span>}
                            {event.max_attendees && <span>👥 {event.max_attendees} max</span>}
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">No events found</div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.event_date}
                                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
                                    <input
                                        type="number"
                                        value={formData.max_attendees}
                                        onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                    {editingEvent ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}