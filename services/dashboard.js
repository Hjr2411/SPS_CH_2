// dashboard.js -> KPIs e séries para gráficos
import { db } from "../config/firebase_config.js";
import {
  collection, getDocs, query
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export async function loadKpis() {
  const q = query(collection(db, "chamados"));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => d.data());
  const total = docs.length;
  const abertos = docs.filter(d => d.status === "Aberto").length;
  const fechados = docs.filter(d => d.status === "Fechado").length;
  const pendentes = docs.filter(d => d.status === "Pendente").length;
  return { total, abertos, fechados, pendentes };
}

export async function loadChartData() {
  const q = query(collection(db, "chamados"));
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => d.data());

  const porPrioridade = countBy(docs.map(d => d.prioridade));
  const porStatus = countBy(docs.map(d => d.status));
  return { porPrioridade, porStatus };
}

function countBy(arr) {
  return arr.reduce((acc, k) => (acc[k] = (acc[k] || 0) + 1, acc), {});
}
