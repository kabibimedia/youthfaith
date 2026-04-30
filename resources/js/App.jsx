import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Events from './pages/Events';
import Devotionals from './pages/Devotionals';
import Quizzes from './pages/Quizzes';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import PrayerWall from './pages/PrayerWall';
import Music from './pages/Music';
import Leaderboard from './pages/Leaderboard';
import Challenges from './pages/Challenges';
import Admin from './pages/Admin';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="events" element={<Events />} />
                    <Route path="devotionals" element={<Devotionals />} />
                    <Route path="quizzes" element={<Quizzes />} />
                    <Route path="music" element={<Music />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="prayers" element={<PrayerWall />} />
                    <Route path="challenges" element={<Challenges />} />
                    <Route path="leaderboard" element={<Leaderboard />} />
                    <Route path="profile/:id?" element={<Profile />} />
                </Route>
            </Routes>
        </AuthProvider>
    );
}
