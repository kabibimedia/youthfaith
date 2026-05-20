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
    register: (data) => api.post('/auth/register', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
    login: (data) => api.post('/auth/login', data),
    adminLogin: (data) => api.post('/auth/admin-login', data),
    logout: () => api.post('/auth/logout'),
    getUser: () => api.get('/auth/user'),
};

export const userService = {
    getUser: (id) => api.get(`/users/${id}`),
    searchUsers: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
    updateProfile: (data) => api.put('/users', data),
    uploadAvatar: (formData) => api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    useRegistrationPhoto: () => api.post('/users/use-registration-photo'),
    getLeaderboard: () => api.get('/users/leaderboard'),
    getBirthdays: () => api.get('/users/birthdays'),
    sendBirthdayWish: (toUserId, message) => api.post('/users/birthdays/wish', { to_user_id: toUserId, message }),
    getBirthdayWishes: () => api.get('/users/birthdays/wishes'),
    getUpcomingBirthdays: () => api.get('/users/birthdays/upcoming'),
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
    sharePost: (id) => api.post(`/posts/${id}/share`),
    getTaggedPosts: (userId) => api.get(`/posts/tagged/${userId}`),
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
    addMusic: (data) => api.post('/music', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
    deleteMusic: (id) => api.delete(`/music/${id}`),
};

export const blogService = {
    getBlogs: () => api.get('/blogs'),
    getBlog: (id) => api.get(`/blogs/${id}`),
    createBlog: (data) => api.post('/blogs', data),
    updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
    deleteBlog: (id) => api.delete(`/blogs/${id}`),
    getMyBlogs: () => api.get('/blogs/my/list'),
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
    sharePost: (postId) => api.post(`/statuses/share/${postId}`),
};

export const sliderService = {
    getActive: () => api.get('/sliders'),
};

export const adminSliderService = {
    getSliders: (params) => api.get('/admin/sliders', { params }),
    createSlider: (formData) => api.post('/admin/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    bulkUpload: (formData) => api.post('/admin/sliders/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updateSlider: (id, formData) => api.post(`/admin/sliders/${id}`, formData),
    deleteSlider: (id) => api.delete(`/admin/sliders/${id}`),
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
    getChallenges: (params) => api.get('/admin/challenges', { params }),
    createChallenge: (data) => api.post('/admin/challenges', data),
    updateChallenge: (id, data) => api.put(`/admin/challenges/${id}`, data),
    deleteChallenge: (id) => api.delete(`/admin/challenges/${id}`),
    getQuizzes: (params) => api.get('/admin/quizzes', { params }),
    createQuiz: (data) => api.post('/admin/quizzes', data),
    updateQuiz: (id, data) => api.put(`/admin/quizzes/${id}`, data),
    deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),
    getBlogs: (params) => api.get('/admin/blogs', { params }),
    updateBlog: (id, data) => api.put(`/admin/blogs/${id}`, data),
    deleteBlog: (id) => api.delete(`/admin/blogs/${id}`),
    getClients: (params) => api.get('/admin/clients', { params }),
    downloadClients: (params) => api.get('/admin/clients/export', { params, responseType: 'blob' }),
    uploadFile: (formData) => api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const duesService = {
    overview: () => api.get('/dues/overview'),
    getPayments: (params) => api.get('/dues/payments', { params }),
    getStatement: () => api.get('/dues/statement'),
    downloadStatementPdf: () => api.get('/dues/statement/pdf', { responseType: 'blob' }),
    downloadStatement: (params) => api.get('/dues/statement/export', { params, responseType: 'blob' }),
    pay: (formData) => api.post('/dues/pay', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getPledges: () => api.get('/dues/pledges'),
    createPledge: (data) => api.post('/dues/pledges', data),
    cancelPledge: (id) => api.put(`/dues/pledges/${id}/cancel`),
    verifyCard: (data) => api.post('/dues/verify-card', data),
    requestCode: () => api.post('/dues/request-code'),
};

export const adminDuesService = {
    getPayments: (params) => api.get('/admin/dues/payments', { params }),
    downloadPayments: (params) => api.get('/admin/dues/payments/export', { params, responseType: 'blob' }),
    approvePayment: (id) => api.post(`/admin/dues/payments/${id}/approve`),
    rejectPayment: (id, notes) => api.post(`/admin/dues/payments/${id}/reject`, { notes }),
    uploadPayment: (formData) => api.post('/admin/dues/payments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getMembers: (params) => api.get('/admin/dues/members', { params }),
    generateCodes: (count) => api.post('/admin/dues/codes/generate', { count }),
    generateCodesForUsers: (userIds) => api.post('/admin/dues/codes/generate-for-users', { user_ids: userIds }),
    getCardRequests: () => api.get('/admin/dues/card-requests'),
    approveCardRequest: (id) => api.post(`/admin/dues/card-requests/${id}/approve`),
    rejectCardRequest: (id, notes) => api.post(`/admin/dues/card-requests/${id}/reject`, { notes }),
    getPendingVerifications: () => api.get('/admin/dues/pending-verifications'),
    verifyUserCard: (userId, status, notes) => api.post('/admin/dues/verify-user-card', { user_id: userId, status, notes }),
};

export const superAdminService = {
    getAdmins: () => api.get('/admin/super/admins'),
    updateAdminRole: (userId, role) => api.put(`/admin/super/admins/${userId}`, { role }),
    deleteAdmin: (userId) => api.delete(`/admin/super/admins/${userId}`),
    promoteToSuperAdmin: (userId) => api.post(`/admin/super/admins/${userId}/promote`),
    getActivityLogs: (params) => api.get('/admin/super/activity-logs', { params }),
};

export const adminLiveService = {
    getSessions: () => api.get('/admin/live'),
    getActiveStreams: () => api.get('/admin/live/active'),
    generateStreamKey: () => api.post('/admin/live/generate-key'),
    assignStreamKey: (sessionId, streamKey) => api.post(`/admin/live/${sessionId}/assign-key`, { stream_key: streamKey }),
    forceEndStream: (sessionId) => api.post(`/admin/live/${sessionId}/force-end`),
};

export const liveService = {
    getLiveSessions: () => api.get('/live'),
    getLiveSession: (id) => api.get(`/live/${id}`),
    startLive: (data) => api.post('/live/start', data),
    endLive: (id, createPost = true) => api.post(`/live/${id}/end`, { create_post: createPost }),
    joinLive: (id) => api.post(`/live/${id}/join`),
    leaveLive: (id) => api.post(`/live/${id}/leave`),
    sendHeart: (id) => api.post(`/live/${id}/heart`),
    sendGift: (id, giftType) => api.post(`/live/${id}/gift`, { gift_type: giftType }),
    getGifts: (id) => api.get(`/live/${id}/gifts`),
    sendComment: (id, message) => api.post(`/live/${id}/comment`, { message }),
    getComments: (id) => api.get(`/live/${id}/comments`),
    setupLive: (data) => api.post('/live/setup', data),
    activateLive: (id) => api.post(`/live/${id}/activate`),
};

export default api;
