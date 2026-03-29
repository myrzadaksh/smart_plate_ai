import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';

export interface User {
    id?: string | number;
    name?: string;
    email?: string;
    [key: string]: any; 
}

interface AuthResponse {
    success: boolean;
    message?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthResponse>;
    register: (name: string, email: string, password: string) => Promise<AuthResponse>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true); 

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser) as User);
            } catch (error) {
                console.error('Ошибка при чтении данных пользователя', error);
            }
        }
        setLoading(false); 
    }, []);

    const login = async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user, token } = response.data.data;

            // Сохраняем сессию
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user as User);

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка при входе'
            };
        }
    };

    const register = async (name: string, email: string, password: string): Promise<AuthResponse> => {
        try {
            const response = await api.post('/auth/signup', { name, email, password });
            const { user, token } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user as User);

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка при регистрации'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};