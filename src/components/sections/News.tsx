// src/components/News.tsx

// [變更] import 內容，不再需要 Firestore 相關類型
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
// [變更] 引入新的、更簡單的服務函式
import { readAllBroadcasts, type NewsData } from "@/firebase/services";

interface Props {
    id: string;
}

// 時間格式化函式，處理 ISO String 或舊的 Timestamp 物件 (保持不變)
function formatTimestamp(timestamp: any): string {
    let date: Date;
    if (!timestamp) return 'N/A';
    if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }
    if (isNaN(date.getTime())) {
        return '無效時間';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
}


function News({ id }: Props) {
    // --- State 管理 (變更) ---
    // 1. 不再需要 pageMarkers 和 pagesData
    // 2. 新增 allNews state 來儲存從 Firebase 一次性獲取的所有訊息
    const [allNews, setAllNews] = useState<NewsData[]>([]);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [currentPage, setCurrentPage] = useState(0);

    const itemsPerPage = 4; // 每頁顯示數量 (保持不變)

    // --- 數據獲取 (變更) ---
    // useEffect 現在只在組件掛載時執行一次，獲取所有數據
    useEffect(() => {
        const fetchAllNewsOnce = async () => {
            setStatus('loading');
            try {
                const data = await readAllBroadcasts();
                setAllNews(data);
                setStatus('success');
            } catch (error) {
                console.error("Failed to fetch all news:", error);
                setStatus('error');
            }
        };
        fetchAllNewsOnce();
    }, []); // 空依賴數組確保只執行一次

    // --- 客戶端分頁邏輯 (變更) ---
    // 1. totalNewsCount 和 totalPages 現在直接從 allNews.length 計算得出
    // 2. "news" 變數（當前頁面要顯示的數據）是從 allNews 陣列中 "slice" 出來的
    const totalNewsCount = allNews.length;
    const totalPages = Math.ceil(totalNewsCount / itemsPerPage);
    const news = allNews.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    // 翻頁函式邏輯保持不變，但依賴的變數已是最新
    const nextPage = () => {
        if ((currentPage + 1) * itemsPerPage < totalNewsCount) {
            setCurrentPage(p => p + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(p => p - 1);
        }
    };
    
    // isLoading 邏輯簡化，只判斷 status
    const isLoading = status === 'loading';

    // --- 渲染邏輯 (UI 和 ClassName 保持原樣) ---
    return (
        <section className='pt-6 pb-10'>
            <h1 id={id} className='block text-balance text-3xl lg:text-4xl font-bold tracking-tight mb-6'>
                最新訊息
            </h1>

            {/* 這個 div 的 className 和結構保持不變 */}
            <div className="rounded-md overflow-hidden min-h-[66vh] flex flex-col">
                <div className="px-4 md:px-6 py-4 border-b border-accent-600">
                    <div className="grid grid-cols-[2.4fr_1.2fr_1fr] items-center text-base font-semibold text-primary-700">
                        <span>內容</span>
                        <span>社團</span>
                        <span>時間</span>
                    </div>
                </div>

                <div className="flex-grow">
                    {/* 狀態顯示邏輯的判斷條件更新，但 UI 元素保持不變 */}
                    {isLoading && (
                        <div className=" text-center flex flex-col items-center h-full mt-6 text-primary-600">
                            <div className="w-10 loader ml-2"></div>
                            <p className=" w-full mt-2 inline-block">　載入中...</p>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="flex justify-center items-center h-full mt-6 text-red-500">
                            <p>讀取資料失敗，請稍後再試。</p>
                        </div>
                    )}
                    {!isLoading && status === 'success' && news.length === 0 && (
                        <div className="flex justify-center items-center h-full mt-6 text-primary-600">
                            <p>目前沒有最新訊息。</p>
                        </div>
                    )}
                    {!isLoading && status === 'success' && news.length > 0 && (
                        // 這裡 map 的是從 allNews 切割出來的 `news` 陣列
                        news.map(((newsItem, i) => (
                            <div key={newsItem.id || i} className="grid grid-cols-[2.4fr_1.3fr_0.9fr] items-center px-4 md:px-6 py-4 text-base hover:bg-primary-100/50">
                                <div className="pr-4 ">
                                    <p className="text-primary-700 font-medium line-clamp-2">{newsItem.content}</p>
                                    {newsItem.link && (
                                        <a
                                            href={newsItem.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-accent-700 hover:text-accent-600 text-base mt-1 hover:underline"
                                        >
                                            相關連結
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                                <div className="pr-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium border border-accent-600 text-primary-700 ">
                                        {newsItem.clubName}
                                    </span>
                                </div>
                                <p className="text-primary-700 font-mono text-sm">{formatTimestamp(newsItem.timestamp)}</p>
                            </div>
                        ))
                        ))}
                </div>
            </div>

            {/* 分頁控制區塊的 UI 和 className 保持不變 */}
            <div className="mt-5 px-4 md:px-6 flex justify-between items-center">
                <div className="text-base text-gray-500">
                    {totalNewsCount > 0
                        ? `第 ${currentPage * itemsPerPage + 1} - ${Math.min((currentPage + 1) * itemsPerPage, totalNewsCount)} 筆，共 ${totalNewsCount} 筆`
                        : '共 0 筆'
                    }
                </div>
                <div className="flex items-center gap-3">
                    <button
                        // disabled 條件更新為依賴 isLoading
                        disabled={currentPage === 0 || isLoading}
                        onClick={prevPage}
                        className="inline-flex items-center px-3 py-1 rounded-lg hover:bg-accent-200 bg-accent-300 disabled:bg-primary-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="hidden md:block">上一頁</span>
                    </button>
                    <span className="text-base text-gray-500">
                        {totalPages > 0 ? `${currentPage + 1} / ${totalPages}` : '0 / 0'}
                    </span>
                    <button
                        // disabled 條件更新為依賴 isLoading 和 totalPages
                        disabled={(currentPage + 1) >= totalPages || isLoading}
                        onClick={nextPage}
                        className="inline-flex items-center px-3 py-1 rounded-lg hover:bg-accent-200 bg-accent-300 disabled:bg-primary-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="hidden md:block">下一頁</span>
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default News;