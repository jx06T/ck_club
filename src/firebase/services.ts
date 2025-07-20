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
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    addDoc,
    getCountFromServer
} from "firebase/firestore";


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