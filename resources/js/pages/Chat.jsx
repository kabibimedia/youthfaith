import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/api';

export default function Chat() {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadRooms();
    }, []);

    useEffect(() => {
        if (selectedRoom) {
            loadMessages(selectedRoom.id);
            const interval = setInterval(() => loadMessages(selectedRoom.id), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadRooms = async () => {
        try {
            const res = await chatService.getRooms();
            setRooms(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (roomId) => {
        try {
            const res = await chatService.getMessages(roomId);
            setMessages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const selectRoom = async (roomId) => {
        setSelectedRoom(rooms.find(r => r.id === roomId));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom) return;
        setSending(true);
        try {
            const res = await chatService.sendMessage(selectedRoom.id, newMessage);
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error(err);
        } finally {
            setSending(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim()) return;
        try {
            await chatService.createRoom({ name: newRoomName, description: newRoomDesc });
            setNewRoomName('');
            setNewRoomDesc('');
            setShowCreate(false);
            loadRooms();
        } catch (err) {
            console.error(err);
        }
    };

    if (!user) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Chat Rooms</h2>
                <p className="text-gray-600">Login to join the conversation!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Chat Rooms</h1>
                <div className="flex items-center gap-2">
                    {selectedRoom && <span className="text-sm text-green-600 flex items-center gap-1">● Live</span>}
                    <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700">
                        + New Room
                    </button>
                </div>
            </div>

            {showCreate && (
                <form onSubmit={handleCreateRoom} className="bg-white rounded-xl p-4 shadow-sm">
                    <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Room name" className="w-full p-3 border rounded-lg mb-2" />
                    <input value={newRoomDesc} onChange={(e) => setNewRoomDesc(e.target.value)} placeholder="Description (optional)" className="w-full p-3 border rounded-lg mb-2" />
                    <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium">Create</button>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                    <h2 className="font-semibold text-gray-800 mb-3">Rooms</h2>
                    {loading ? (
                        <p className="text-gray-500">Loading...</p>
                    ) : rooms.length === 0 ? (
                        <p className="text-gray-500">No rooms yet</p>
                    ) : (
                        <div className="space-y-2">
                            {rooms.map(room => (
                                <div key={room.id} onClick={() => selectRoom(room.id)}
                                    className={`p-3 rounded-lg cursor-pointer ${selectedRoom?.id === room.id ? 'bg-purple-100' : 'hover:bg-gray-50'}`}>
                                    <p className="font-medium text-gray-800">{room.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{room.description || 'No description'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm">
                    {selectedRoom ? (
                        <>
                            <h2 className="font-semibold text-gray-800 mb-3">{selectedRoom.name}</h2>
                            <div className="h-80 overflow-y-auto space-y-3 mb-4 p-2 border rounded-lg">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs p-3 rounded-lg ${msg.user_id === user.id ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                            <p className="text-xs font-medium mb-1 opacity-75">{msg.user?.name}</p>
                                            <p>{msg.message}</p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 p-3 border rounded-lg" />
                                <button type="submit" disabled={sending} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Select a room to start chatting</p>
                    )}
                </div>
            </div>
        </div>
    );
}