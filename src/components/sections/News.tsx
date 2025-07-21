import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

import {
    // [更新] 1. 引入新的、更具體的函式
    readBroadcastsWithPagination,
    getTotalDocumentCount,
    type NewsData,
} from "@/firebase/services";

import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

interface Props {
    id: string;
}

// [更新] 2. 使用更強健的時間戳格式化函式，與 BroadcastsAdmin 組件保持一致
function formatTimestamp(timestamp: any): string {
    let date: Date;
    if (!timestamp) return 'N/A';

    // 檢查是否為 Firestore Timestamp 物件
    if (typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    }
    // 否則，嘗試將其作為 ISO 字串或數字處理 (兼容舊數據)
    else {
        date = new Date(timestamp);
    }

    // 檢查轉換後的日期是否有效
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
    const [currentPage, setCurrentPage] = useState(0);
    const [totalNewsCount, setTotalNewsCount] = useState(0);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    const pageMarkers = useRef<(QueryDocumentSnapshot<DocumentData> | null)[]>([null]);

    const itemsPerPage = 4;
    const totalPages = Math.ceil(totalNewsCount / itemsPerPage);
    const NEWS_COLLECTION = "broadcasts";
    const [pagesData, setPagesData] = useState<{ [pageIndex: number]: NewsData[] }>({});
    const news = pagesData[currentPage] || [];

    const fetchNews = useCallback(async (pageIndex: number) => {
        setStatus('loading');
        try {
            const lastVisibleDoc = pageMarkers.current[pageIndex] || null;
            const { data, lastVisibleDoc: newLastVisibleDoc } =
                await readBroadcastsWithPagination(itemsPerPage, lastVisibleDoc);

            // [變更] 將獲取的資料存入 pagesData 對應的頁碼下
            setPagesData(prevData => ({
                ...prevData,
                [pageIndex]: data,
            }));

            // 管理分頁標記
            if (pageIndex + 1 >= pageMarkers.current.length && newLastVisibleDoc) {
                pageMarkers.current.push(newLastVisibleDoc);
            }
            setStatus('success');
        } catch (error) {
            console.error("Failed to fetch news:", error);
            setStatus('error');
        }
    }, [itemsPerPage]);

    useEffect(() => {
        const initialLoad = async () => {
            setStatus('loading');
            try {
                const count = await getTotalDocumentCount(NEWS_COLLECTION);
                setTotalNewsCount(count);
                if (count === 0) {
                    setStatus('success');
                }
            } catch (error) {
                console.error("Failed to get total count:", error);
                setStatus('error');
            }
        };
        initialLoad();
    }, []);

    useEffect(() => {
        if (totalNewsCount > 0 && !pagesData[currentPage]) {
            fetchNews(currentPage);
        }
    }, [currentPage, totalNewsCount, pagesData, fetchNews]);

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

    const isLoading = status === 'loading' || (totalNewsCount > 0 && news.length === 0 && status !== 'error');

    return (
        <section className='pt-6 pb-10'>
            <h1 id={id} className='block text-balance text-3xl lg:text-4xl font-bold tracking-tight mb-6'>
                最新訊息
            </h1>

            <div className="rounded-md overflow-hidden min-h-[66vh] flex flex-col">
                <div className="px-4 md:px-6 py-4 border-b border-accent-600">
                    <div className="grid grid-cols-[2.4fr_1.2fr_1fr] items-center text-base font-semibold text-primary-700">
                        <span>內容</span>
                        <span>社團</span>
                        <span>時間</span>
                    </div>
                </div>

                <div className="flex-grow">
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
                        news.map(((newsItem, i) => (
                            <div key={newsItem.id || i} className="grid grid-cols-[2.4fr_1.2fr_1fr] items-center px-4 md:px-6 py-4 text-base hover:bg-primary-100/50">
                                {/* ... 內容不變 ... */}
                                <div className="pr-4 ">
                                    <p className="text-primary-700 font-medium line-clamp-2">{newsItem.content}</p>
                                    {newsItem.link && (
                                        <a
                                            href={newsItem.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-accent-700 hover:text-accent-600 text-base mt-1 hover:underline"
                                        >
                                            詳細訊息
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

            <div className="mt-5 px-4 md:px-6 flex justify-between items-center">
                <div className="text-base text-gray-500">
                    {totalNewsCount > 0
                        ? `第 ${currentPage * itemsPerPage + 1} - ${Math.min((currentPage + 1) * itemsPerPage, totalNewsCount)} 筆，共 ${totalNewsCount} 筆`
                        : '共 0 筆'
                    }
                </div>
                <div className="flex items-center gap-3">
                    <button
                        disabled={currentPage === 0 || status === 'loading'}
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
                        disabled={(currentPage + 1) * itemsPerPage >= totalNewsCount || status === 'loading'}
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