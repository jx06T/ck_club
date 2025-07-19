import type { APIRoute } from 'astro';
import { db, auth } from '../../../firebase/server';

export const prerender = false;

// 處理 GET 請求：讀取讚數
export const GET: APIRoute = async ({ params, request }) => {
    console.log("按讚後端被戳(GET)")

    const { clubCode } = params;

    if (!clubCode) {
        return new Response("Club Code is required", { status: 400 });
    }

    try {
        const clubRef = db.collection('clubs').doc(clubCode);
        const clubDoc = await clubRef.get();

        const likeCount = clubDoc.exists ? clubDoc.data()?.likeCount || 0 : 0;
        let isLikedByCurrentUser = false;

        // 檢查使用者是否登入並查詢其按讚狀態
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const idToken = authHeader.split('Bearer ')[1];
            try {
                const decodedToken = await auth.verifyIdToken(idToken);
                const uid = decodedToken.uid;
                const likeRef = db.collection('likes').doc(`${uid}_${clubCode}`);
                const likeDoc = await likeRef.get();
                if (likeDoc.exists) {
                    isLikedByCurrentUser = true;
                }
            } catch (error) {
                // Token 無效或過期，視為未登入處理，不報錯
                console.warn("Invalid or expired token received.");
            }
        }

        return new Response(JSON.stringify({ likeCount, isLikedByCurrentUser }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error fetching likes:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};

// 處理 POST 請求：按讚或取消讚
export const POST: APIRoute = async ({ params, request }) => {
    console.log("按讚後端被戳(POST)");

    const { clubCode } = params;

    if (!clubCode) {
        return new Response("Club Code is required", { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response("Unauthorized: Missing token", { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];

    let uid: string;
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        uid = decodedToken.uid;
    } catch (error) {
        return new Response("Unauthorized: Invalid token", { status: 401 });
    }

    const { action } = await request.json();
    if (action !== 'like' && action !== 'unlike') {
        return new Response("Invalid action", { status: 400 });
    }

    const clubRef = db.collection('clubs').doc(clubCode);
    const likeRef = db.collection('likes').doc(`${uid}_${clubCode}`);
    try {
        await db.runTransaction(async (transaction) => {
            // --- 第一步：執行所有讀取操作 ---
            const clubDoc = await transaction.get(clubRef);
            const likeDoc = await transaction.get(likeRef);

            const currentLikeCount = clubDoc.data()?.likeCount || 0;

            // --- 第二步：根據讀取結果，執行所有寫入操作 ---
            if (action === 'like') {
                if (likeDoc.exists) {
                    return;
                }
                transaction.set(likeRef, { userId: uid, clubCode, createdAt: new Date() });

                // --- 這是修正的核心 ---
                // 使用 set 和 merge:true 來取代 update
                // 這樣如果 clubs/A01 文件不存在，它會被自動創建
                transaction.set(clubRef, { likeCount: currentLikeCount + 1 }, { merge: true });

            } else if (action === 'unlike') {
                if (!likeDoc.exists) {
                    return;
                }
                transaction.delete(likeRef);

                // --- 這裡也一樣，用 set 和 merge:true 更安全 ---
                // 雖然取消讚時文件通常都存在，但保持一致性是好習慣
                transaction.set(clubRef, { likeCount: currentLikeCount - 1 }, { merge: true });
            }
        });

        return new Response(JSON.stringify({ message: "Success" }), { status: 200 });
    } catch (error) {
        console.error("Transaction failed:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
};