import {
    auth,
    db
} from './client';

import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    type User
} from "firebase/auth";

import {
    orderBy,
    doc,
    getDoc,
    limit,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    startAfter,
    getDocs,
    query,
    where,
    addDoc,
    getCountFromServer,
    runTransaction,
    type DocumentData,
    type QueryDocumentSnapshot
} from "firebase/firestore";

export type { User };

export interface NewsData {
    id: string;
    // timestamp 可以是 Firestore Timestamp 物件或 ISO 字串，組件中的格式化函式已處理
    timestamp: any;
    email: string;
    clubId: string;
    clubName: string;
    content: string;
    link?: string;
}

export interface BroadcastInput {
    clubId: string;
    clubName: string;
    content: string;
    link?: string;
}


// =================================================================
// ---            現有的通用服務 (保持不變)                   ---
// =================================================================

const provider = new GoogleAuthProvider();

/** 觸發 Google 登入彈出視窗 */
export const triggerSignIn = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Sign-in failed:", error);
        return null;
    }
};

/** 登出當前使用者 */
export const triggerSignOut = (): Promise<void> => {
    return signOut(auth);
};

/** 監聽身份驗證狀態變化，並執行回呼函式 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * 創建或完全覆蓋一個文件
 * @param collectionName 集合名稱
 * @param docId 文件 ID
 * @param data 要寫入的數據
 */
export const createDocument = (collectionName: string, docId: string, data: object) => {
    return setDoc(doc(db, collectionName, docId), data);
};

/**
 * 創建一個文件
 * @param collectionName 集合名稱
 * @param data 要寫入的數據
 */
export const addDocument = (collectionName: string, data: object) => {
    return addDoc(collection(db, collectionName), data);
};

/**
 * 讀取單個文件
 * @param collectionName 集合名稱
 * @param docId 文件 ID
 */
export const readDocument = async (collectionName: string, docId: string) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
};

/**
 * 讀取一個集合中的所有文件
 * @param collectionName 集合名稱
 */
export const readCollection = async (collectionName: string) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * 更新一個文件的部分欄位
 * @param collectionName 集合名稱
 * @param docId 文件 ID
 * @param data 要更新的數據
 */
export const updateDocument = (collectionName: string, docId: string, data: object) => {
    return updateDoc(doc(db, collectionName, docId), data);
};

/**
 * 刪除一個文件
 * @param collectionName 集合名稱
 * @param docId 文件 ID
 */
export const deleteDocument = (collectionName: string, docId: string) => {
    return deleteDoc(doc(db, collectionName, docId));
};

export const countDocuments = async (collectionName: string, field: string, value: any): Promise<number> => {
    const q = query(collection(db, collectionName), where(field, "==", value));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
};

// --- 通用分頁讀取函式 (將 readNewsCollectionWithPagination 改為更通用的名稱) ---
export const readCollectionWithPagination = async (
    collectionName: string,
    itemsPerPage: number,
    lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null
) => {
    let q = query(
        collection(db, collectionName),
        orderBy("timestamp", "desc"),
        limit(itemsPerPage)
    );

    if (lastVisibleDoc) {
        q = query(q, startAfter(lastVisibleDoc));
    }

    const querySnapshot = await getDocs(q);

    const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    return {
        data,
        lastVisibleDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
};

/**
 * 獲取集合中的文件總數
 * @param collectionName 集合名稱
 */
export const getTotalDocumentCount = async (collectionName: string): Promise<number> => {
    const coll = collection(db, collectionName);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
};


const BROADCASTS_COLLECTION = 'site_data'; // 集合名稱
const BROADCASTS_DOC_ID = 'broadcasts';  // 固定的文件 ID
const ADMIN_COLLECTION = 'announcementAdmins';
const MAX_BROADCASTS = 30; // 最大訊息數量限制

/**
 * 檢查當前登入使用者是否為訊息管理員
 * (此函式邏輯不變)
 */
export const checkAnnouncementAdminStatus = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) return false;
    try {
        const adminDoc = await readDocument(ADMIN_COLLECTION, user.uid);
        return adminDoc !== null;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

// ==========================


/**
 * 讀取所有廣播訊息。
 * 從單一文件中讀取 'messages' 陣列。
 * @returns {Promise<NewsData[]>} 回傳排序後的訊息陣列。
 */
export const readAllBroadcasts = async (): Promise<NewsData[]> => {
    try {
        const docRef = doc(db, BROADCASTS_COLLECTION, BROADCASTS_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            // 確保 messages 存在且為陣列，並在客戶端進行排序以保證順序
            const messages: NewsData[] = data.messages || [];
            return messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return []; // 如果文件不存在，回傳空陣列
    } catch (error) {
        console.error("Error reading all broadcasts:", error);
        throw error; // 拋出錯誤讓呼叫者處理
    }
};

/**
 * 新增一則訊息到 'messages' 陣列中。
 * 使用 Transaction 確保讀取和寫入的原子性。
 * @param broadcastData - 新訊息的內容。
 */
export const addBroadcast = async (broadcastData: BroadcastInput): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const broadcastDocRef = doc(db, BROADCASTS_COLLECTION, BROADCASTS_DOC_ID);

    try {
        await runTransaction(db, async (transaction) => {
            const broadcastDoc = await transaction.get(broadcastDocRef);
            const existingMessages: NewsData[] = broadcastDoc.exists() ? broadcastDoc.data().messages || [] : [];

            const newBroadcast: NewsData = {
                ...broadcastData,
                id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // 產生唯一的 ID
                email: user.email!,
                timestamp: new Date().toISOString(), // 使用 ISO 8601 格式字串
            };

            // 將新訊息加到陣列最前面
            let updatedMessages = [newBroadcast, ...existingMessages];

            // 如果超過最大數量限制，則移除最舊的訊息
            if (updatedMessages.length > MAX_BROADCASTS) {
                updatedMessages = updatedMessages.slice(0, MAX_BROADCASTS);
            }

            // 使用 set 搭配 merge:true，如果文件不存在會自動建立
            transaction.set(broadcastDocRef, { messages: updatedMessages }, { merge: true });
        });
    } catch (error) {
        console.error("Failed to add broadcast via transaction:", error);
        throw error;
    }
};

/**
 * 從 'messages' 陣列中刪除一則訊息。
 * 使用 Transaction 確保操作安全。
 * @param id - 要刪除的訊息的唯一 ID。
 */
export const deleteBroadcast = async (id: string): Promise<void> => {
    const broadcastDocRef = doc(db, BROADCASTS_COLLECTION, BROADCASTS_DOC_ID);

    try {
        await runTransaction(db, async (transaction) => {
            const broadcastDoc = await transaction.get(broadcastDocRef);
            if (!broadcastDoc.exists()) return; // 文件不存在，無需操作

            const existingMessages: NewsData[] = broadcastDoc.data().messages || [];

            // 過濾掉要刪除的訊息
            const updatedMessages = existingMessages.filter(msg => msg.id !== id);

            // 更新文件中的陣列
            transaction.update(broadcastDocRef, { messages: updatedMessages });
        });
    } catch (error) {
        console.error("Failed to delete broadcast via transaction:", error);
        throw error;
    }
};

// ==========================

export const getSurveyTotalCount = async (): Promise<number> => {
    const surveyStats = await readDocument('stats', 'survey');
    if (surveyStats && typeof surveyStats.count === 'number') {
        return surveyStats.count;
    }
    return 0;
};