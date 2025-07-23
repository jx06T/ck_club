import { useEffect, useState, type FormEvent } from 'react';
import {
    onAuthStateChange,
    triggerSignIn,
    triggerSignOut,
    type User,
    checkAnnouncementAdminStatus,
    readAllBroadcasts,
    addBroadcast,
    deleteBroadcast,
    type NewsData,
    type BroadcastInput,
} from '@/firebase/services';

import { Plus, Trash2, LogOut, Loader } from 'lucide-react';
import createConfirmDialog from '@components/ConfirmDialog';

// 時間戳格式化函式，處理 ISO String 或舊的 Timestamp 物件
function formatAdminTimestamp(timestamp: any): string {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        if (isNaN(date.getTime())) return '無效時間';

        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${month}/${day} ${hour}:${minute}`;
    } catch (e) {
        return '格式錯誤';
    }
}

function BroadcastsAdmin() {
    const [user, setUser] = useState<User | null>(null);
    const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
    const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied'>('checking');
    const [broadcasts, setBroadcasts] = useState<NewsData[]>([]);
    const [contentStatus, setContentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // 防止重複提交
    const [formState, setFormState] = useState<BroadcastInput>({
        clubId: '', clubName: '', content: '', link: ''
    });

    const handleSignIn = async () => {
        await triggerSignIn();
    };

    // [新增] 獨立的資料獲取函式，方便重用
    const fetchData = async () => {
        setContentStatus('loading');
        try {
            const data = await readAllBroadcasts();
            setBroadcasts(data);
            setContentStatus('success');
        } catch (err) {
            console.error(err);
            setContentStatus('error');
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChange(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setAuthStatus('authenticated');
                setPermissionStatus('checking');
                const hasPermission = await checkAnnouncementAdminStatus();
                if (hasPermission) {
                    setPermissionStatus('granted');
                    await fetchData(); // 權限確認後獲取資料
                } else {
                    setPermissionStatus('denied');
                }
            } else {
                setAuthStatus('unauthenticated');
                setPermissionStatus('denied');
                setBroadcasts([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setFormError(null);
        if (!formState.clubName || !formState.content) {
            setFormError("社團名稱和訊息內容為必填項！");
            return;
        }
        setIsSubmitting(true);
        try {
            await addBroadcast(formState);
            setFormState({ clubId: '', clubName: '', content: '', link: '' });
            await fetchData();
        } catch (err) {
            console.error(err);
            setFormError("新增失敗！請確認您的權限或網路連線。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        createConfirmDialog("刪除這則訊息？", "這個操作無法復原", async () => {
            try {
                await deleteBroadcast(id);
                await fetchData(); // [變更] 刪除成功後，重新獲取完整列表以刷新
            } catch (error) {
                console.error("刪除失敗", error);
                // 可以在此處彈出錯誤提示
            }
        }, () => {}, "刪除", "取消")
    };

    // --- 渲染邏輯 (這部分幾乎不用改！) ---
    const renderContent = () => {
        if (authStatus === 'loading') {
            return <div className="p-2 lg:p-8 min-h-[60vh] text-center flex justify-center items-center"><Loader className="animate-spin mr-2" /> 正在確認登入狀態...</div>;
        }
        if (authStatus === 'unauthenticated') {
            return (
                <div className="p-2 lg:p-8 min-h-[60vh] text-center text-red-500">
                    請先 <button className='underline underline-offset-2 cursor-pointer' onClick={handleSignIn}>登入</button> 以使用管理功能。
                </div>
            );
        }
        if (permissionStatus === 'checking') {
            return <div className="p-2 lg:p-8 min-h-[60vh] text-center flex justify-center items-center"><Loader className="animate-spin mr-2" /> 正在驗證管理員權限...</div>;
        }
        if (permissionStatus === 'denied') {
            return (
                <div className="p-2 lg:p-8 min-h-[60vh] text-center text-red-500">
                    <p>您的帳號 ({user?.email}) 不具備訊息管理權限。</p>
                    <p className="text-sm mt-2 text-primary-600">請聯繫網站管理員以獲取權限。</p>
                </div>
            );
        }
        return (
            <div className=' p-2 lg:p-8'>
                <section className="mb-12 p-6 bg-primary-50 rounded-lg ">
                    <h2 className="text-xl font-semibold mb-4">新增訊息</h2>
                    <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 表單內容不變 */}
                        <input required type="text" placeholder="社團名稱" value={formState.clubName} onChange={e => setFormState({ ...formState, clubName: e.target.value })} className="p-2  outline-hidden rounded-md focus:ring-1 focus:ring-accent-500 bg-neutral-100" />
                        <input required type="text" placeholder="社團 ID" value={formState.clubId} onChange={e => setFormState({ ...formState, clubId: e.target.value })} className="p-2  outline-hidden rounded-md focus:ring-1 focus:ring-accent-500 bg-neutral-100" />
                        <textarea required placeholder="訊息內容" value={formState.content} onChange={e => setFormState({ ...formState, content: e.target.value })} className="p-2  outline-hidden rounded-md md:col-span-2 focus:ring-1 focus:ring-accent-500 bg-neutral-100" rows={3}></textarea>
                        <input type="url" placeholder="相關連結 (選填，請包含 https://)" value={formState.link || ''} onChange={e => setFormState({ ...formState, link: e.target.value })} className="p-2  outline-hidden rounded-md md:col-span-2 focus:ring-1 focus:ring-accent-500 bg-neutral-100" />
                        <button type="submit" disabled={isSubmitting} className="flex justify-center items-center gap-2 p-2 bg-accent-500 text-white outline-hidden rounded-md hover:bg-accent-600 md:col-span-2 transition-colors disabled:bg-gray-400">
                            {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                            {isSubmitting ? "發布中..." : "發布訊息"}
                        </button>
                        {formError && <p className="text-red-500 text-sm md:col-span-2">{formError}</p>}
                    </form>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">已發布訊息列表 ({broadcasts.length} / 30)</h2>
                    {contentStatus === 'loading' && <div className='text-center py-8'>正在載入訊息列表...</div>}
                    {contentStatus === 'error' && <div className='text-center py-8 text-red-500'>訊息列表載入失敗。</div>}
                    {contentStatus === 'success' && (
                        <div className="space-y-3">
                            {broadcasts.length > 0 ? broadcasts.map(b => (
                                <div key={b.id} className="px-4 pt-3 pb-2 bg-primary-50 rounded-lg relative">
                                    {/* 列表內容不變 */}
                                    <div className=''>
                                        <p className="font-semibold">{b.clubName} <span className="text-sm text-gray-400">({b.clubId || 'N/A'})</span></p>
                                        <p className="text-primary-700 my-1 whitespace-pre-wrap">{b.content}</p>
                                        <div className=' flex justify-between mt-10'>
                                            {b.link ? <a href={b.link} target="_blank" rel="noopener noreferrer" className="text-accent-700 hover:underline text-sm break-all">{b.link}</a> : "無外部連結"}
                                            <p className="text-xs text-gray-400 mt-2">發布於: {formatAdminTimestamp(b.timestamp)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full shrink-0 transition-colors absolute right-4 top-3">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-8">目前沒有任何訊息。</p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        );
    };

    return (
        <div className=" w-full mx-auto p-2 lg:p-8 -mt-12">
            <header className="flex flex-wrap justify-between items-center gap-4 mb-8 px-2">
                <div>
                    <h1 className="text-3xl font-bold">訊息管理</h1>
                    {user && <p className="text-gray-500 text-sm">正在以 {user.email} 身份登入</p>}
                </div>
                {authStatus === 'authenticated' && (
                    <button onClick={triggerSignOut} className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-sm rounded-md hover:bg-gray-300 transition-colors">
                        <LogOut size={16} /> 登出
                    </button>
                )}
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
}

export default BroadcastsAdmin;