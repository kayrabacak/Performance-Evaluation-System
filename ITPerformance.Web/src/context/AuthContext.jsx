import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Context'i oluşturuyoruz.
const AuthContext = createContext(null);

// 2. Bu context'i kullanmak için basit bir hook oluşturuyoruz.
export const useAuth = () => {
    return useContext(AuthContext);
};

// contexti saglayacak provider'ı oluşturuyoruz.
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Kullanıcı bilgilerini tutacak state
    const [token, setToken] = useState(null); // Token'ı tutacak state

    // Uygulama ilk yüklendiğinde, localStorage'da kayıtlı bir token var mı kontrolu
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Login fonksiyonu: Kullanıcı bilgilerini ve token'ı alıp state'e ve localStorage'a kaydeder.
    const login = (userData, authToken) => {
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
    };

    // Logout fonksiyonu: State'i ve localStorage'ı temizler.
    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
    };

    
    const value = {
        user,
        token,
        isLoggedIn: !!token, // Token varsa, kullanıcı giriş yapmış demektir.
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
