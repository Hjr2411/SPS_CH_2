// chamados.js -> CRUD na coleção "chamados"
import { db } from "../config/firebase_config.js";
import {
  collection, addDoc, serverTimestamp, getDocs, query, orderBy, updateDoc, doc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getSession } from "./auth.js";

export async function createChamado({ titulo, descricao, prioridade, status }) {
  const user = getSession();
  if (!user) throw new Error("Sessão expirada.");
  const payload = {
    titulo, descricao, prioridade, status,
    criadoEm: serverTimestamp(),
    criadoPor: { uid: user.uid, username: user.username }
  };
  const ref = await addDoc(collection(db, "chamados"), payload);
  return { id: ref.id, ...payload };
}

export async function listChamados({ busca = "", status = "", prioridade = "" } = {}) {
  // Por simplicidade, filtra no cliente após obter; para grandes volumes, use queries compostas
  const q = query(collection(db, "chamados"), orderBy("criadoEm", "desc"));
  const snap = await getDocs(q);
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return list.filter(c =>
    (!busca || c.titulo?.toLowerCase().includes(busca)) &&
    (!status || c.status === status) &&
    (!prioridade || c.prioridade === prioridade)
  );
}

export async function updateChamado(id, fields) {
  const ref = doc(db, "chamados", id);
  await updateDoc(ref, fields);
}

export async function deleteChamado(id) {
  await deleteDoc(doc(db, "chamados", id));
}
