import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/api';

export default function Events() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const res = await eventService.getEvents();
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (eventId) => {
        try {
            await eventService.joinEvent(eventId);
            loadEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join');
        }
    };

    const handleLeave = async (eventId) => {
        try {
            await eventService.leaveEvent(eventId);
            loadEvents();
        } catch (err) {
            console.error(err);
        }
    };

    const isJoined = (event) => event.attendees?.some(a => a.id === user?.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">📅 Upcoming Events</h1>
                    <p className="text-gray-500 mt-1">Join events and grow together with the community</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-3">Loading events...</p>
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No events yet</h3>
                    <p className="text-gray-500">Check back later for upcoming events!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-lg shadow-purple-100 border border-purple-50 hover:shadow-xl transition-all">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
                                            Upcoming
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                                    <p className="text-gray-600 mt-2 leading-relaxed">{event.description}</p>
                                    <div className="flex flex-wrap gap-4 mt-4 text-gray-500">
                                        <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                                            📅 {new Date(event.event_date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                                            📍 {event.location || 'TBD'}
                                        </span>
                                    </div>
                                    {event.max_attendees && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                                <span>👥 {event.attendees?.length || 0}/{event.max_attendees} spots filled</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" 
                                                    style={{ width: `${((event.attendees?.length || 0) / event.max_attendees) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {user && (
                                    <div className="flex-shrink-0 flex items-center">
                                        <button onClick={() => isJoined(event) ? handleLeave(event.id) : handleJoin(event.id)}
                                            className={`px-8 py-3 rounded-xl font-bold transition-all ${
                                                isJoined(event) 
                                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
                                            }`}>
                                            {isJoined(event) ? '✓ Joined' : '🚀 Join Event'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}