// src/pages/api/feedback.ts (微調後)
import type { APIRoute } from 'astro';
import { db } from '../../firebase/server';

export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_API_URL = "https://api.resend.com/emails";

export const POST: APIRoute = async ({ request }) => {
    console.log("反饋後端被戳");

    try {
        const { email, feedbackText, pageUrl, type } = await request.json();

        // 1. 數據驗證 (後端驗證是安全的保障)
        if (!email || !feedbackText || !type) {
            return new Response(JSON.stringify({ message: "缺少必要欄位 (Email, 反饋內容, 類型)" }), { status: 400 });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ message: "Email 格式不正確" }), { status: 400 });
        }

        // 2. 寫入 Firestore
        await db.collection('feedbackSubmissions').add({
            userEmail: email, // 存入資料庫時，欄位名可以保持清晰
            feedbackText,
            pageUrl,
            type, // 使用從前端傳來的 type
            submittedAt: new Date(),
        });

        // 3. 發送確認郵件
        const emailPayload = {
            from: '建中社團資料庫 <noreply@your-domain.com>',
            to: [email],
            subject: '感謝您對建中社團資料庫的回饋！',
            html: `<h1>您好！</h1><p>我們已經收到了您的問題回饋，內容如下：</p><blockquote>${feedbackText}</blockquote><p>我們會盡快處理，感謝您的支持與貢獻！</p>`,
        };

        const emailResponse = await fetch(RESEND_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailPayload),
        });

        if (!emailResponse.ok) {
            // 記錄錯誤，但仍然告訴前端提交成功，因為數據已經寫入了
            console.error("發送確認信失敗:", await emailResponse.text());
        }

        return new Response(JSON.stringify({ message: "Feedback received successfully" }), {
            status: 201,
        });

    } catch (error) {
        console.error("處理回饋時發生錯誤:", error);
        return new Response(JSON.stringify({ message: "伺服器內部錯誤" }), { status: 500 });
    }
};