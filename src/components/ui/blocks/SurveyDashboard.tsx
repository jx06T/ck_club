import { useState, useEffect } from 'react';
import { useAuth } from '@/scripts/useAuth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
    triggerSignIn,
    getSurveyTotalCount
} from '@/firebase/services';

import { Download } from 'lucide-react';

export default function SurveyDashboard() {
    const { user, isLoading } = useAuth();
    const [surveyCount, setSurveyCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            setError("請先登入以查看此頁面。");
            setIsFetching(false);
            return;
        }

        const fetchSurveyCount = async () => {
            setIsFetching(true);
            setError(null);
            try {
                const count = await getSurveyTotalCount();
                setSurveyCount(count);
            } catch (e: any) {
                console.error(e);
                if (e.code === 'permission-denied') {
                    setError("載入數據失敗，您可能沒有權限。");
                } else {
                    setError(e.message || "載入數據時發生未知錯誤。");
                }
            } finally {
                setIsFetching(false);
            }
        };

        fetchSurveyCount();
    }, [user, isLoading]);

    // 處理 CSV 導出
    const handleExport = async () => {
        setIsExporting(true);
        setError(null);
        try {
            const functions = getFunctions();
            // 呼叫導出問卷的 Cloud Function
            const exportCsv = httpsCallable(functions, 'exportSurveyAsCsv');
            const result = await exportCsv();
            const csvString = (result.data as { csv: string }).csv;

            if (!csvString) {
                alert("沒有數據可供導出。");
                return;
            }

            // 創建並觸發下載
            const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF 確保 Excel 能正確讀取 UTF-8
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `survey_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (e: any) {
            console.error(e);
            if (e.code === 'permission-denied') {
                setError("導出失敗，您沒有權限。");
            } else {
                setError(e.message || "導出失敗。");
            }
        } finally {
            setIsExporting(false);
        }
    };

    if (isFetching) {
        return <div className="p-8 min-h-[60vh] text-center flex justify-center items-center">載入儀表板數據...</div>;
    }

    if (!user) {
        return (
            <div className="p-8 min-h-[60vh] text-center text-red-500">
                請先{' '}
                <button
                    className='underline underline-offset-2 cursor-pointer'
                    onClick={async () => {
                        const signedInUser = await triggerSignIn();
                        if (signedInUser) {
                            window.location.reload(); // 重新載入頁面以觸發權限檢查
                        } else {
                            alert("登入失敗，請再試一次。");
                        }
                    }}
                >
                    登入
                </button>
                {' '}以查看此頁面
            </div>
        );
    }

    if (error) {
        return <div className="p-8 min-h-[60vh] text-center text-red-500">{error}</div>;
    }

    return (
        <div className="container mx-auto p-8 -mt-12">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">問卷回收狀況</h1>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 bg-accent-500 text-white font-bold py-2 px-4 rounded hover:bg-accent-600 disabled:bg-gray-400 transition-colors"
                >
                    <Download size={18} />
                    {isExporting ? '正在導出...' : '下載所有問卷資料 (.csv)'}
                </button>
            </div>

            <div className="bg-primary-50 p-8 rounded-lg text-center shadow-md">
                <h2 className="text-xl font-semibold text-primary-700 mb-2">目前總共回收問卷數</h2>
                <p className="text-6xl font-bold text-accent-600">
                    {surveyCount}
                </p>
                <p className="text-primary-600 mt-2">份</p>
            </div>
        </div>
    );
}