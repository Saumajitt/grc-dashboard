
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import api, { setAuthToken } from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { _id, email, role, ... }
    const [loading, setLoading] = useState(true);

    // on mount: load token, fetch profile if token exists
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setAuthToken(token);
            api
                .get("/users/profile")
                .then((res) => {
                    setUser(res.data.user || null);
                })
                .catch(() => {
                    // invalid token or error -> clear
                    localStorage.removeItem("token");
                    setAuthToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // login: returns role for redirect decision
    const login = async (email, password) => {
        const res = await api.post("/users/login", { email, password });
        const { token, role } = res.data;
        if (!token) throw new Error("No token returned");
        localStorage.setItem("token", token);
        setAuthToken(token);
        // fetch profile
        const profile = await api.get("/users/profile");
        setUser(profile.data.user);
        return role;
    };

    const logout = async () => {
        try {
            await api.post("/users/logout");
        } catch (err) {
            // ignore error - still clear locally
        }
        localStorage.removeItem("token");
        setAuthToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
