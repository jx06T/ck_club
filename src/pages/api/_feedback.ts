// import type { APIRoute } from 'astro';
// import { db } from '../../firebase/server';

// export const prerender = false;

// const GAS_WEB_APP_URL = import.meta.env.PUBLIC_FEEDBACK_URL;

// export const POST: APIRoute = async ({ request }) => {
//     try {
//         const { email, feedbackText, pageUrl, type } = await request.json();

//         if (!email || !feedbackText) {
//             return new Response(JSON.stringify({ message: "缺少必要欄位" }), { status: 400 });
//         }

//         await db.collection('feedbackSubmissions').add({
//             userEmail: email,
//             feedbackText,
//             pageUrl,
//             type,
//             submittedAt: new Date(),
//         });

//         if (GAS_WEB_APP_URL) {
//             const params = new URLSearchParams({
//                 email: email,
//                 feedbackText: feedbackText, 
//                 pageUrl: pageUrl,
//                 type: type
//             });

//             try {
//                 const gasResponse = await fetch(`${GAS_WEB_APP_URL}?${params.toString()}`);
//                 if (!gasResponse.ok) {
//                     // 如果 GAS 出錯，只在後端記錄，不影響給前端的回應
//                     console.error("呼叫 GAS 失敗:", gasResponse.status, await gasResponse.text());
//                 } else {
//                     console.log("成功觸發 GAS 郵件服務。");
//                 }
//             } catch (gasError) {
//                 console.error("連接 GAS 時發生錯誤:", gasError);
//             }
//         } else {
//             console.warn("未設定 GAS_FEEDBACK_URL，跳過郵件發送。");
//         }

//         return new Response(JSON.stringify({ message: "Feedback received successfully" }), {
//             status: 201,
//         });

//     } catch (error) {
//         console.error("處理回饋時發生錯誤:", error);
//         return new Response(JSON.stringify({ message: "伺服器內部錯誤" }), { status: 500 });
//     }
// };