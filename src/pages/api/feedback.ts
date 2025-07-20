import type { APIRoute } from 'astro';
import { addDocument } from '../../firebase/services'; 

export const prerender = false;

const GAS_WEB_APP_URL = import.meta.env.PUBLIC_FEEDBACK_URL;

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, feedbackText, pageUrl, type } = await request.json();

        if (!email || !feedbackText) {
            return new Response(
                JSON.stringify({ message: "缺少必要欄位: email 和 feedbackText 為必填項。" }), 
                { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const dataToSubmit = {
            userEmail: email,
            feedbackText,
            pageUrl,
            type,
            submittedAt: new Date(), 
        };

        await addDocument('feedbackSubmissions', dataToSubmit);

        if (GAS_WEB_APP_URL) {
            const params = new URLSearchParams({
                email: email,
                feedbackText: feedbackText, 
                pageUrl: pageUrl || 'N/A',
                type: type || 'General'     
            });

            // 使用 context.waitUntil 可以確保它執行完畢，但為了簡單起見，直接 await 也可以
            try {
                const gasResponse = await fetch(`${GAS_WEB_APP_URL}?${params.toString()}`);
                if (!gasResponse.ok) {
                    console.error("呼叫 GAS 失敗:", { status: gasResponse.status, text: await gasResponse.text() });
                } else {
                    console.log("成功觸發 GAS 郵件服務。");
                }
            } catch (gasError) {
                console.error("連接 GAS 時發生錯誤:", gasError);
            }
        } else {
            console.warn("未在環境變數中設定 PUBLIC_FEEDBACK_URL，跳過郵件發送。");
        }

        return new Response(
            JSON.stringify({ message: "回饋已成功接收" }), 
            {
                status: 201, // 201 Created
                headers: { 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error("處理回饋 API 請求時發生錯誤:", error);
        return new Response(
            JSON.stringify({ message: "伺服器內部錯誤，請稍後再試" }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
};