import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: 請替換成你實際的 Firebase 專案設定
const firebaseConfig = {
  apiKey: "AIzaSyCxHedzhXAYra27cH41WYsbPZ1vrVpSKlU",
  authDomain: "domanmahjong.firebaseapp.com",
  projectId: "domanmahjong",
  storageBucket: "domanmahjong.firebasestorage.app",
  messagingSenderId: "539121050808",
  appId: "1:539121050808:web:ac351387d70b7929ac004d"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出 auth 與 googleProvider 供其他元件使用
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);