import { useState, useEffect } from 'react';
import { adminService } from '../../services/api';

export default function QuizzesPanel() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({
        title: '', question: '', options: ['', '', '', ''], correct_answer: 0, points: 10,
    });

    useEffect(() => { loadQuizzes(); }, [search]);

    const loadQuizzes = async () => {
        try {
            const res = await adminService.getQuizzes({ search });
            setQuizzes(res.data.data || res.data);
        } catch {} finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const filteredOptions = form.options.filter(o => o.trim() !== '');
        const data = { ...form, options: filteredOptions, correct_answer: parseInt(form.correct_answer), points: parseInt(form.points) };
        try {
            if (editing) {
                await adminService.updateQuiz(editing.id, data);
            } else {
                await adminService.createQuiz(data);
            }
            closeModal();
            loadQuizzes();
        } catch { alert('Failed to save quiz'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this quiz?')) return;
        try {
            await adminService.deleteQuiz(id);
            loadQuizzes();
        } catch { alert('Failed to delete'); }
    };

    const openEdit = (q) => {
        setEditing(q);
        setForm({
            title: q.title,
            question: q.question,
            options: q.options.length >= 4 ? q.options : [...q.options, ...Array(4 - q.options.length).fill('')],
            correct_answer: q.correct_answer,
            points: q.points,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditing(null);
        setForm({ title: '', question: '', options: ['', '', '', ''], correct_answer: 0, points: 10 });
    };

    const updateOption = (i, val) => {
        const opts = [...form.options];
        opts[i] = val;
        setForm({ ...form, options: opts });
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Quizzes Management</h2>
                <div className="flex gap-3">
                    <input type="text" placeholder="Search quizzes..." value={search} onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
                    <button onClick={closeModal} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">+ Add Quiz</button>
                </div>
            </div>
            <div className="space-y-2">
                {quizzes.length === 0 && <p className="text-center py-8 text-gray-400">No quizzes found</p>}
                {quizzes.map(q => (
                    <div key={q.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-sm">🎯</div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-800 truncate">{q.title}</div>
                                <div className="text-xs text-gray-400">{q.options?.length || 0} options · ⭐ {q.points} pts</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => openEdit(q)} className="text-purple-600 hover:text-purple-700 text-sm">Edit</button>
                            <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{editing ? 'Edit Quiz' : 'Create Quiz'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Quiz title"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required placeholder="Question" rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Answer Options</label>
                                    {form.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-1.5">
                                            <input type="radio" name="correct" checked={form.correct_answer === i} onChange={() => setForm({ ...form, correct_answer: i })} />
                                            <input type="text" value={opt} onChange={(e) => updateOption(i, e.target.value)} required placeholder={`Option ${i + 1}`}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                            {i === form.options.length - 1 && form.options.length < 8 && (
                                                <button type="button" onClick={() => setForm({ ...form, options: [...form.options, ''] })}
                                                    className="text-purple-600 hover:text-purple-700 text-sm">+</button>
                                            )}
                                            {form.options.length > 2 && (
                                                <button type="button" onClick={() => {
                                                    const opts = form.options.filter((_, j) => j !== i);
                                                    setForm({ ...form, options: opts, correct_answer: form.correct_answer >= i ? Math.max(0, form.correct_answer - 1) : form.correct_answer });
                                                }} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                        <input type="number" min="1" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{editing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
