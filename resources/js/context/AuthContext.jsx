import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [justLoggedIn, setJustLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            authService.getUser()
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (login, password) => {
        const res = await authService.login({ login, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setJustLoggedIn(true);
    };

    const adminLogin = async (login, password) => {
        const res = await authService.adminLogin({ login, password });
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
    };

    const register = async (data) => {
        const res = await authService.register(data);
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user);
        setJustLoggedIn(true);
    };

    const logout = async () => {
        try {
            await authService.logout();
        } finally {
            localStorage.removeItem('token');
            setUser(null);
            setJustLoggedIn(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, adminLogin, register, logout, loading, justLoggedIn, setJustLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
