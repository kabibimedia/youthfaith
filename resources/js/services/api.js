import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getUser: () => api.get('/auth/user'),
};

export const userService = {
    getUser: (id) => api.get(`/users/${id}`),
    updateProfile: (data) => api.put('/users', data),
    uploadAvatar: (formData) => api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getLeaderboard: () => api.get('/users/leaderboard'),
};

const EMOJI_MAP = {
    'like': '👍',
    'fire': '🔥',
    'love': '💖',
    'pray': '🙏',
    'wow': '😮',
};

export const postService = {
    getPosts: (page = 1) => api.get(`/posts?page=${page}`),
    createPost: (data) => api.post('/posts', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updatePost: (id, data) => api.put(`/posts/${id}`, data),
    deletePost: (id) => api.delete(`/posts/${id}`),
    likePost: (id, emojiKey = 'fire') => api.post(`/posts/${id}/like`, { emoji: EMOJI_MAP[emojiKey] || '🔥' }),
    commentPost: (id, comment, parentId = null) => api.post(`/posts/${id}/comment`, { comment, parent_id: parentId }),
    getComments: (id) => api.get(`/posts/${id}/comments`),
};

export const eventService = {
    getEvents: () => api.get('/events'),
    getEvent: (id) => api.get(`/events/${id}`),
    joinEvent: (id) => api.post(`/events/${id}/join`),
    leaveEvent: (id) => api.post(`/events/${id}/leave`),
    createEvent: (data) => api.post('/events', data),
};

export const devotionalService = {
    getDevotionals: () => api.get('/devotionals'),
    getToday: () => api.get('/devotionals/today'),
    getDevotional: (id) => api.get(`/devotionals/${id}`),
};

export const quizService = {
    getQuizzes: () => api.get('/quizzes'),
    submitAnswer: (quizId, answer) => api.post('/quizzes/submit', { quiz_id: quizId, answer }),
    getLeaderboard: () => api.get('/quizzes/leaderboard'),
};

export const chatService = {
    getRooms: () => api.get('/chat'),
    createRoom: (data) => api.post('/chat', data),
    getRoom: (id) => api.get(`/chat/${id}`),
    getMessages: (id) => api.get(`/chat/${id}/messages`),
    sendMessage: (id, message) => api.post(`/chat/${id}/messages`, { message }),
};

export const prayerService = {
    getPrayers: () => api.get('/prayers'),
    createPrayer: (data) => api.post('/prayers', data),
    pray: (id) => api.post(`/prayers/${id}/pray`),
};

export const musicService = {
    getMusic: () => api.get('/music'),
    addMusic: (data) => api.post('/music', data),
    deleteMusic: (id) => api.delete(`/music/${id}`),
};

export const challengeService = {
    getChallenges: () => api.get('/challenges'),
    joinChallenge: (id) => api.post(`/challenges/${id}/join`),
    completeChallenge: (id) => api.post(`/challenges/${id}/complete`),
};

export const statusService = {
    getStatuses: () => api.get('/statuses'),
    getMyStatuses: () => api.get('/statuses/my'),
    createStatus: (data) => api.post('/statuses', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteStatus: (id) => api.delete(`/statuses/${id}`),
};

export const adminService = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getPosts: (params) => api.get('/admin/posts', { params }),
    deletePost: (id) => api.delete(`/admin/posts/${id}`),
    getEvents: (params) => api.get('/admin/events', { params }),
    createEvent: (data) => api.post('/admin/events', data),
    updateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
    deleteEvent: (id) => api.delete(`/admin/events/${id}`),
    getPrayers: (params) => api.get('/admin/prayers', { params }),
    deletePrayer: (id) => api.delete(`/admin/prayers/${id}`),
    getComments: (params) => api.get('/admin/comments', { params }),
    deleteComment: (id) => api.delete(`/admin/comments/${id}`),
};

export default api;