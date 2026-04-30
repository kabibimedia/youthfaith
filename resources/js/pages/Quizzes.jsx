import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService } from '../services/api';

export default function Quizzes() {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const res = await quizService.getQuizzes();
            setQuizzes(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (answer === null) return;
        setSubmitting(true);
        try {
            const res = await quizService.submitAnswer(selected.id, answer);
            setResult(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Bible Quizzes</h1>

            {!user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    Login to earn points and compete on the leaderboard!
                </div>
            )}

            {selected ? (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <button onClick={() => { setSelected(null); setAnswer(null); setResult(null); }} className="text-purple-600 font-medium mb-4">← Back to Quizzes</button>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{selected.title}</h2>
                    <p className="text-gray-600 mb-6">{selected.question}</p>
                    
                    {result ? (
                        <div className={`p-4 rounded-lg ${result.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <p className="font-medium">{result.correct ? '🎉 Correct!' : '❌ Wrong answer'}</p>
                            <p className="mt-2">You earned {result.points_earned} points!</p>
                            {!result.correct && <p className="mt-2 text-sm">Correct answer: {selected.options[result.correct_answer]}</p>}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selected.options.map((option, i) => (
                                <label key={i} className={`flex items-center p-3 border rounded-lg cursor-pointer ${answer === i ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="answer" checked={answer === i} onChange={() => setAnswer(i)} className="mr-3" />
                                    <span className="text-gray-700">{option}</span>
                                </label>
                            ))}
                            <button onClick={handleSubmit} disabled={answer === null || submitting}
                                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 mt-4">
                                {submitting ? 'Submitting...' : 'Submit Answer'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {quizzes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No quizzes available yet</div>
                    ) : quizzes.map(quiz => (
                        <div key={quiz.id} onClick={() => setSelected(quiz)} className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition">
                            <h3 className="font-semibold text-gray-800">{quiz.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{quiz.question}</p>
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-sm text-purple-600 font-medium">{quiz.points} points</span>
                                <span className="text-sm text-gray-400">Tap to answer →</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}