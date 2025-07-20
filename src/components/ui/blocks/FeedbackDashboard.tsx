import { useState, useEffect } from 'react';
import { useAuth } from '@/scripts/useAuth';
import { getFunctions, httpsCallable } from 'firebase/functions';

// 定義從後端獲取的數據類型
interface Statistics {
    totalCount: number;
    typeCounts: Record<string, number>;
    pageUrlCounts: Record<string, number>;
}
interface FeedbackItem {
    id: string;
    userEmail: string;
    feedbackText: string;
    pageUrl: string;
    type: string;
    submittedAt: string;
}

export default function FeedbackDashboard() {
    const { user, isLoading, getIdToken } = useAuth();
    const [stats, setStats] = useState<Statistics | null>(null);
    const [latestFeedback, setLatestFeedback] = useState<FeedbackItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    // 獲取儀表板數據
    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            setError("請先登入以查看此頁面。");
            setIsFetching(false);
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const functions = getFunctions();
                const getDashboardData = httpsCallable(functions, 'getAdminDashboardData');
                const result = await getDashboardData();
                const data = result.data as { statistics: Statistics, latestFeedback: FeedbackItem[] };

                setStats(data.statistics);
                setLatestFeedback(data.latestFeedback);
            } catch (e) {
                console.error(e);
                if (typeof e === "string") {
                    e.toUpperCase()
                    setError(e.toUpperCase() || "載入數據失敗，您可能沒有權限。");
                } else if (e instanceof Error) {
                    setError(e.message || "載入數據失敗，您可能沒有權限。");
                }
            } finally {
                setIsFetching(false);
            }
        };

        fetchDashboardData();
    }, [user, isLoading]);

    // 處理 CSV 導出
    const handleExport = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const functions = getFunctions();
            const exportCsv = httpsCallable(functions, 'exportFeedbackAsCsv');
            const result = await exportCsv();
            const csvString = (result.data as { csv: string }).csv;

            if (!csvString) {
                console.log("沒有數據可供導出。")
                return;
            }

            // 創建並觸發下載
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `feedback_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (e) {
            console.error(e);
            if (typeof e === "string") {
                e.toUpperCase()
                setError(e.toUpperCase() || "導出失敗。");
            } else if (e instanceof Error) {
                setError(e.message || "導出失敗。");
            }
        } finally {
            setIsExporting(false);
        }
    };

    if (isFetching) return <div className="p-8 min-h-[60vh] text-center">正在載入儀表板數據...</div>;
    if (error) return <div className="p-8 min-h-[60vh] text-center text-red-500">{error}</div>;
    if (!stats) return <div className="p-8 min-h-[60vh] text-center">沒有可顯示的數據。</div>;

    return (
        <div className="container mx-auto p-8 -mt-12">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">反饋彙整</h1>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-accent-500 text-white font-bold py-2 px-4 rounded hover:bg-accent-600 disabled:bg-gray-400 transition-colors"
                >
                    {isExporting ? '正在導出...' : '下載所有資料 (.csv)'}
                </button>
            </div>
            <p className="mb-8 text-lg">
                總共收到 <span className="font-bold text-accent-500">{stats.totalCount}</span> 份反饋
            </p>

            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-primary-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">類型分佈</h2>
                    <ul>
                        {Object.entries(stats.typeCounts).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                            <li key={type} className="flex justify-between py-1">
                                <span>{type}</span>
                                <span className="font-mono">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-primary-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">頁面分佈</h2>
                    <ul>
                        {Object.entries(stats.pageUrlCounts).sort(([, a], [, b]) => b - a).map(([page, count]) => (
                            <li key={page} className="flex justify-between py-1 text-sm break-all">
                                <span>{page}</span>
                                <span className="font-mono ml-4 shrink-0">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* 最新 10 條數據表格 */}
            <h2 className="text-2xl font-bold mt-12 mb-4">最新 10 筆回饋</h2>
            <div className="w-full overflow-x-auto bg-primary-50 rounded-lg no-scrollbar " onWheel={(e) => {
                if (e.deltaY !== 0 && e.shiftKey) {
                    e.stopPropagation();
                    // @ts-ignore
                    e.target.scrollLeft += e.deltaY;
                }
            }}>
                <table className="w-full text-sm text-left text-primary-700">
                    <thead className="text-base text-primary-800 uppercase bg-primary-50 sticky top-0 border-b border-accent-500">
                        <tr>
                            <th className="px-6 py-3">提交時間</th>
                            <th className="px-6 py-3">類型</th>
                            <th className="px-6 py-3">內文</th>
                            <th className="px-6 py-3">頁面</th>
                            <th className="px-6 py-3">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestFeedback.map((fb) => (
                            <tr key={fb.id} className="not-last:border-b border-neutral-100 hover:bg-primary-100/20">
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(fb.submittedAt).toLocaleString('zh-TW')}</td>
                                <td className="px-6 py-4">{fb.type}</td>
                                <td className="px-6 py-4 max-w-sm truncate" title={fb.feedbackText}>{fb.feedbackText}</td>
                                <td className="px-6 py-4 max-w-xs truncate" title={fb.pageUrl}>{fb.pageUrl}</td>
                                <td className="px-6 py-4">{fb.userEmail}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}