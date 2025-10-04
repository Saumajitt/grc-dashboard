// src/context/RefreshContext.jsx
"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
    const [refreshFlag, setRefreshFlag] = useState(0);
    const triggerRefresh = () => setRefreshFlag((f) => f + 1);

    const value = useMemo(
        () => ({
            refreshFlag,
            triggerRefresh,
        }),
        [refreshFlag]
    );

    return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
}

export function useRefresh() {
    const ctx = useContext(RefreshContext);
    if (!ctx) throw new Error("useRefresh must be used within RefreshProvider");
    return ctx;
}
