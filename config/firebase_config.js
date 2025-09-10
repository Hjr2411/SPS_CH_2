// /config/firebase_config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "NUM",
  appId: "APP_ID",
  databaseURL: "https://SEU_PROJETO-default-rtdb.firebaseio.com" // obrigatório p/ RTDB
};

export const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const db = getFirestore(app); // opcional
