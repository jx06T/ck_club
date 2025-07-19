import type { APIRoute } from 'astro';
import { db } from '../../firebase/server';

export const prerender = false;

// 從環境變數中讀取你的 GAS URL，更安全
const GAS_WEB_APP_URL = import.meta.env.PUBLIC_FEEDBACK_URL;

export const POST: APIRoute = async ({ request }) => {
    console.log("反饋後端被戳 (GAS 版本)");

    try {
        const { email, feedbackText, pageUrl, type } = await request.json();

        // 1. 數據驗證
        if (!email || !feedbackText) {
            return new Response(JSON.stringify({ message: "缺少必要欄位" }), { status: 400 });
        }
        // ... 其他驗證 ...

        // 2. 寫入 Firestore (這是主要任務)
        await db.collection('feedbackSubmissions').add({
            userEmail: email,
            feedbackText,
            pageUrl,
            type,
            submittedAt: new Date(),
        });

        // 3. 呼叫現有的 GAS 服務來發送郵件 (這是次要任務)
        if (GAS_WEB_APP_URL) {
            // 將參數打包成 URLSearchParams
            const params = new URLSearchParams({
                email: email,
                feedbackText: feedbackText, 
                pageUrl: pageUrl,
                type: type
            });

            try {
                // 發起請求到 GAS
                const gasResponse = await fetch(`${GAS_WEB_APP_URL}?${params.toString()}`);
                if (!gasResponse.ok) {
                    // 如果 GAS 出錯，只在後端記錄，不影響給前端的回應
                    console.error("呼叫 GAS 失敗:", gasResponse.status, await gasResponse.text());
                } else {
                    console.log("成功觸發 GAS 郵件服務。");
                }
            } catch (gasError) {
                console.error("連接 GAS 時發生錯誤:", gasError);
            }
        } else {
            console.warn("未設定 GAS_FEEDBACK_URL，跳過郵件發送。");
        }

        // 4. 無論郵件是否成功，都告訴前端主要任務已完成
        return new Response(JSON.stringify({ message: "Feedback received successfully" }), {
            status: 201,
        });

    } catch (error) {
        console.error("處理回饋時發生錯誤:", error);
        return new Response(JSON.stringify({ message: "伺服器內部錯誤" }), { status: 500 });
    }
};