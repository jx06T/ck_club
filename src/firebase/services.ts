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
    Timestamp, // 引入 Timestamp 以便在新增時使用伺服器時間
    type DocumentData,
    type QueryDocumentSnapshot
} from "firebase/firestore";

// --- 現有類型定義 ---
export type { User }; // 從 firebase/auth 重新導出 User 類型，方便組件引用

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

// --- 新增的類型定義，與組件中的保持一致 ---
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


const BROADCASTS_COLLECTION = 'broadcasts';
const ADMIN_COLLECTION = 'announcementAdmins'; 

/**
 * 檢查當前登入使用者是否為訊息管理員
 * 實現方式：檢查 'announcementAdmins' 集合中是否存在以使用者 UID 為 ID 的文件
 * @returns {Promise<boolean>} 如果是管理員則返回 true，否則返回 false
 */
export const checkAnnouncementAdminStatus = async (): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
        return false;
    }
    try {
        // 嘗試讀取 'announcementAdmins/{user.uid}' 這個文件
        const adminDoc = await readDocument(ADMIN_COLLECTION, user.uid);
        // 如果文件存在(adminDoc 不為 null)，則代表該用戶是管理員
        return adminDoc !== null;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false; // 發生錯誤時，保守地返回 false
    }
};

/**
 * 新增一則訊息
 * @param broadcastData - 包含 clubName, content 等訊息內容的物件
 */
export const addBroadcast = (broadcastData: BroadcastInput): Promise<any> => {
    const user = auth.currentUser;
    if (!user) {
        // 這是一個保護措施，理論上組件在呼叫此函式前應已確認登入
        return Promise.reject(new Error("User is not authenticated."));
    }

    const newBroadcast = {
        ...broadcastData,
        email: user.email, // 記錄發布者的 email
        uid: user.uid,     // 記錄發布者的 UID
        timestamp: Timestamp.now(), // 使用 Firestore 伺服器時間戳，最準確
    };

    // 使用現有的通用 addDocument 函式
    return addDocument(BROADCASTS_COLLECTION, newBroadcast);
};

/**
 * 刪除一則訊息
 * @param id - 要刪除的訊息文件 ID
 */
export const deleteBroadcast = (id: string): Promise<void> => {
    // 使用現有的通用 deleteDocument 函式
    return deleteDocument(BROADCASTS_COLLECTION, id);
};

/**
 * 帶分頁地讀取訊息列表
 * 這是對通用分頁函式的一個具體封裝，方便組件直接呼叫
 * @param itemsPerPage - 每頁顯示的項目數量
 * @param lastVisibleDoc - 上一頁的最後一個文件，用於分頁
 * @returns {Promise<{ data: NewsData[], lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | undefined }>}
 */
export const readBroadcastsWithPagination = async (
    itemsPerPage: number,
    lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<{ data: NewsData[], lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | undefined }> => {
    // 使用通用分頁讀取函式
    const result = await readCollectionWithPagination(BROADCASTS_COLLECTION, itemsPerPage, lastVisibleDoc);
    
    // 將返回的數據斷言為 NewsData[] 類型，以符合組件的期待
    return {
        ...result,
        data: result.data as NewsData[],
    };
};

/**
 * 為了兼容舊的命名，保留 readNewsCollectionWithPagination
 * @deprecated 建議使用更通用的 readCollectionWithPagination
 */
export const readNewsCollectionWithPagination = (
    collectionName: string,
    itemsPerPage: number,
    lastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null
) => {
    console.warn("readNewsCollectionWithPagination is deprecated. Please use readCollectionWithPagination.");
    return readCollectionWithPagination(collectionName, itemsPerPage, lastVisibleDoc);
};