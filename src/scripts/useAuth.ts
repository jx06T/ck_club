import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';

import { onAuthStateChange, triggerSignIn, triggerSignOut } from '../firebase/services';

interface MinimalAuth {
    isLoggedIn: boolean;
    user: User | null;
    signIn: () => Promise<User | null>;
    signOut: () => Promise<void>;
    getIdToken: () => Promise<string | null>;
    isLoading: boolean;
}
export function useAuth(): MinimalAuth {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 使用 useEffect 來訂閱 Firebase 的身份驗證狀態變化
    useEffect(() => {
        // onAuthStateChange 返回一個 unsubscribe 函式
        const unsubscribe = onAuthStateChange((firebaseUser) => {
            setUser(firebaseUser); // 更新 user 狀態
            setIsLoading(false); // 檢查完成
        });

        return () => unsubscribe();
    }, []);

    // 使用 useCallback 來封裝 getIdToken 方法，避免不必要的重新渲染
    const getIdToken = useCallback(async (): Promise<string | null> => {
        if (!user) {
            return null;
        }
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error("Failed to get ID token:", error);
            return null;
        }
    }, [user]);

    return {
        isLoggedIn: !!user,
        user,
        signIn: triggerSignIn,
        signOut: triggerSignOut,
        getIdToken,
        isLoading,
    };
}