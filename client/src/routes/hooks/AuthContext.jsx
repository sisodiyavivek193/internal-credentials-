import LoadingScreen from '@/components/loading-screen/LoadingScreen';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user: user1 } = useSelector((state) => state.auth);

    useEffect(() => {
        // ✅ App load pe localStorage check karo
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');
        if (accessToken && refreshToken && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (<LoadingScreen />);
    }
    const value = {
        isAuthenticated: !!user1,
        user: user1,
        loading,
        accessToken: localStorage.getItem("access_token") || null,
        refreshToken: localStorage.getItem("refresh_token") || null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
