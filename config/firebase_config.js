// config/firebase_config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

// 🔧 Cole o SEU config real aqui:
export const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "NUMERO",
  appId: "APP_ID",
  databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com" // importante p/ RTDB
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
