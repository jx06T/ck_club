import { app } from '../../../firebase/client';

import { useState, useEffect } from 'react';
import { getAuth, signOut, onAuthStateChanged, type User } from 'firebase/auth';

function LogoutButton() {
    // 1. 使用 useState 來儲存當前的使用者狀態
    // 初始值為 null，表示未知或未登入
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    // 新增一個 loading 狀態，避免在初始檢查完成前閃爍
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const auth = getAuth(app);

    // 2. 使用 useEffect 來監聽身份驗證狀態的變化
    useEffect(() => {
        // onAuthStateChanged 會在組件掛載時立即執行一次，
        // 並在之後的登入/登出事件時再次執行。
        // 它會回傳一個 unsubscribe 函式，用於清理。
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // 當狀態改變時，更新我們的 state
            setCurrentUser(user);
            // 無論登入與否，初始檢查都已完成，取消 loading 狀態
            setIsLoading(false);
        });

        // 3. 組件卸載時，清理監聽器，避免記憶體洩漏
        return () => {
            unsubscribe();
        };
    }, []); // 空依賴陣列 `[]` 確保這個 effect 只在組件掛載和卸載時運行一次

    // 處理登出（現在叫「清除驗證」）的函式
    const handleClearAuth = async () => {
        try {
            await signOut(auth);
            console.log("Authentication cleared successfully.");
            // 登出後，onAuthStateChanged 會自動觸發，將 currentUser 設為 null
            // 所以我們不需要在這裡手動 setCurrentUser(null)
        } catch (error) {
            console.error("Failed to clear authentication:", error);
        }
    };

    // 4. 根據狀態決定要渲染什麼內容

    // 在 Firebase 完成初始狀態檢查前，顯示讀取中...
    if (isLoading) {
        return <div className="text-sm text-primary-900">驗證狀態讀取中...</div>;
    }

    // 如果 currentUser 不是 null，代表使用者已驗證
    if (currentUser) {
        return (
            <div className="text-sm text-primary-900 flex items-center gap-2">
                {/* 顯示使用者的 Google 顯示名稱 */}
                <span>已透過 <strong>{currentUser.displayName || 'Google 使用者'}</strong> 驗證</span>
                <span>|</span>
                {/* 提供清除驗證的按鈕 */}
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
