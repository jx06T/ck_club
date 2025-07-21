// 導入所有需要的模組
const { onDocumentWritten, onDocumentCreated } = require("firebase-functions/v2/firestore");
const { HttpsError, onCall } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

// ------------------------------------------------------------------
// 函式 1: 更新社團按讚數
// ------------------------------------------------------------------
exports.updateLikeCount = onDocumentWritten("likes/{likeId}", async (event) => {
    // ... 您的程式碼完全不變 ...
    const likeId = event.params.likeId;
    const parts = likeId.split("_");
    if (parts.length !== 2) {
        console.warn("likes 文件ID 格式錯誤:", likeId);
        return null;
    }
    const clubCode = parts[1];
    const clubRef = db.collection("clubs").doc(clubCode);

    const beforeExists = event.data?.before?.exists || false;
    const afterExists = event.data?.after?.exists || false;

    let incrementValue = 0;
    if (!beforeExists && afterExists) {
        incrementValue = 1;
    } else if (beforeExists && !afterExists) {
        incrementValue = -1;
    } else {
        return null;
    }

    await clubRef.set(
        {
            likeCount: FieldValue.increment(incrementValue),
        },
        { merge: true }
    );
    console.log(`clubs/${clubCode} likeCount 已更新，變化量：${incrementValue}`);
    return null;
});


// -------------------------------------

function convertJsonToCsv(data) {
    if (!data || data.length === 0) {
        return "";
    }

    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';

    data.forEach(row => {
        const values = headers.map(header => {
            let cell = row[header] === undefined || row[header] === null ? "" : row[header];
            if (cell.toDate && typeof cell.toDate === 'function') {
                cell = cell.toDate().toISOString();
            }
            let cellString = String(cell);
            if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
                cellString = '"' + cellString.replace(/"/g, '""') + '"';
            }
            return cellString;
        });
        csv += values.join(',') + '\n';
    });
    return csv;
}



exports.updateSurveyCount = onDocumentCreated("surveyResponses/{docId}", async (event) => {
    const statsRef = db.collection("stats").doc("survey"); // 目標文件是 stats/survey
    // 原子性地將 count 欄位加 1
    await statsRef.set(
        {
            count: FieldValue.increment(1),
        },
        { merge: true }
    );

    console.log("Survey stats/survey count updated successfully.");
    return null;
});

exports.exportSurveyAsCsv = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', '需要認證才能執行此操作。');
    }
    const uid = request.auth.uid;
    const adminDoc = await db.collection('admins').doc(uid).get();
    if (!adminDoc.exists) {
        throw new HttpsError('permission-denied', '您沒有管理員權限。');
    }

    const SURVEY_COLLECTION_NAME = 'surveyResponses';

    const surveySnapshot = await db.collection(SURVEY_COLLECTION_NAME).orderBy('submittedAt', 'desc').get();
    const surveyData = surveySnapshot.docs.map(doc => doc.data());

    const csv = convertJsonToCsv(surveyData);
    return { csv };
});

// ------------------------------------------------------------------
// 函式 2: 更新回饋統計數據的觸發器
// ------------------------------------------------------------------
exports.updateFeedbackStats = onDocumentCreated("feedbackSubmissions/{docId}", async (event) => {
    const newFeedback = event.data.data();
    const type = newFeedback.type || "未分類";
    const pageUrl = newFeedback.pageUrl || "未知頁面";

    const statsRef = db.collection("stats").doc("feedback");

    try {
        await db.runTransaction(async (transaction) => {
            const statsDoc = await transaction.get(statsRef);
            const currentStats = statsDoc.data() || {};

            const newTotalCount = (currentStats.totalCount || 0) + 1;

            const newTypeCounts = { ...(currentStats.typeCounts || {}) };
            newTypeCounts[type] = (newTypeCounts[type] || 0) + 1;

            const newPageUrlCounts = { ...(currentStats.pageUrlCounts || {}) };
            newPageUrlCounts[pageUrl] = (newPageUrlCounts[pageUrl] || 0) + 1;

            transaction.set(statsRef, {
                totalCount: newTotalCount,
                typeCounts: newTypeCounts,
                pageUrlCounts: newPageUrlCounts,
                lastUpdated: FieldValue.serverTimestamp(),
            }, { merge: true });
        });
        console.log("Feedback stats updated successfully.");
    } catch (error) {
        console.error("Error updating feedback stats:", error);
    }
});


// ------------------------------------------------------------------
// 函式 3: 獲取儀表板數據的可呼叫函式
// ------------------------------------------------------------------
exports.getAdminDashboardData = onCall(async (request) => {
    // 驗證使用者是否為管理員
    if (!request.auth) {
        throw new HttpsError('unauthenticated', '需要認證才能執行此操作。');
    }
    const uid = request.auth.uid;
    const adminDoc = await db.collection('admins').doc(uid).get();
    if (!adminDoc.exists) {
        throw new HttpsError('permission-denied', '您沒有管理員權限。');
    }

    // 獲取統計數據
    const statsDoc = await db.collection('stats').doc('feedback').get();
    const statistics = statsDoc.data() || { totalCount: 0, typeCounts: {}, pageUrlCounts: {} };

    // 獲取最新的 10 條回饋
    const feedbackSnapshot = await db.collection('feedbackSubmissions')
        .orderBy('submittedAt', 'desc')
        .limit(10)
        .get();

    const latestFeedback = feedbackSnapshot.docs.map(doc => {
        const data = doc.data();
        // 轉換時間戳為 ISO 字符串，方便前端處理
        return {
            id: doc.id,
            ...data,
            submittedAt: data.submittedAt.toDate().toISOString(),
        };
    });

    return { statistics, latestFeedback };
});


// ------------------------------------------------------------------
// 函式 4: 導出所有回饋為 CSV 的可呼叫函式
// ------------------------------------------------------------------
exports.exportFeedbackAsCsv = onCall(async (request) => {
    if (!request.auth) { throw new HttpsError('unauthenticated', '需要認證才能執行此操作。'); }
    const uid = request.auth.uid;
    const adminDoc = await db.collection('admins').doc(uid).get();
    if (!adminDoc.exists) { throw new HttpsError('permission-denied', '您沒有管理員權限。'); }

    const feedbackSnapshot = await db.collection('feedbackSubmissions').orderBy('submittedAt', 'desc').get();
    const feedbackData = feedbackSnapshot.docs.map(doc => doc.data());

    // 使用共用輔助函式
    const csv = convertJsonToCsv(feedbackData);
    return { csv };
});