import { app } from '../../../firebase/client';
import { LogosGoogleIcon } from '@components/ui/Icons'

import { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged, type User } from 'firebase/auth';

function LogoutButton() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // 新增一個 loading 狀態，避免在初始檢查完成前閃爍
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const auth = getAuth(app);

    useEffect(() => {
        // onAuthStateChanged 會在組件掛載時立即執行一次，
        // 並在之後的登入/登出事件時再次執行。
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setIsLoading(false);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleClearAuth = async () => {
        try {
            await signOut(auth);
            await fetch("/api/signout", {});
            console.log("Authentication cleared successfully.");
        } catch (error) {
            console.error("Failed to clear authentication:", error);
        }
    };

    if (isLoading) {
        return <div className="text-sm text-primary-900">驗證狀態讀取中...</div>;
    }

    if (currentUser) {
        return (
            <div className="text-sm text-primary-900 flex items-center gap-2">
                <span><LogosGoogleIcon className=' inline-block mr-1 mb-1 w-4 h-4' />已驗證 {'( ' + currentUser.displayName + ' )' || ''}</span>
                <span>|</span>
                <button
                    onClick={handleClearAuth}
                    className='underline hover:text-accent-500 transition-colors'
                >
                    清除身分驗證
                </button>
            </div>
        );
    }

    return null;
}
export default LogoutButton;
