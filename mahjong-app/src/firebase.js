import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCxHedzhXAYra27cH41WYsbPZ1vrVpSKlU",
  authDomain: "domanmahjong.firebaseapp.com",
  projectId: "domanmahjong",
  storageBucket: "domanmahjong.firebasestorage.app",
  messagingSenderId: "539121050808",
  appId: "1:539121050808:web:ac351387d70b7929ac004d"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);