// /services/auth.js
// Autenticação simples usando Realtime Database em app/users
// Estrutura esperada no RTDB:
// app/users/<username> = { password: string, ativo: boolean, admin: boolean, nome?: string }

import { rtdb } from "../config/firebase_config.js";
import {
  ref, get, child
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const SESSION_KEY = "sps_session";

// ---------- Sessão ----------
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
  catch { return null; }
}
export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
export function logout() {
  clearSession();
}

// Proteções de rota
export function requireAuth() {
  const sess = getSession();
  if (!sess) {
    window.location.replace("./index.html");
    return null;
  }
  return sess;
}
export function requireAdmin(user = getSession()) {
  if (!user || user.role !== "admin") {
    alert("Acesso restrito a administradores.");
    window.location.replace("./dashboard.html");
  }
}

// ---------- Helpers ----------
function mapUser(usernameKey, data) {
  if (!data) return null;
  return {
    id: usernameKey,
    username: data.nome ?? usernameKey,
    role: data.admin ? "admin" : "user",
    active: !!data.ativo,
    password: data.password ?? ""
  };
}

async function fetchUserByUsernameKey(usernameKey) {
  const snap = await get(child(ref(rtdb), `app/users/${usernameKey}`));
  return snap.exists() ? mapUser(usernameKey, snap.val()) : null;
}

// fallback: procurar por "nome" quando a chave do nó não for o username digitado
async function fetchUserByNome(nome) {
  const snap = await get(child(ref(rtdb), "app/users"));
  if (!snap.exists()) return null;
  const all = snap.val();
  for (const [key, val] of Object.entries(all)) {
    if ((val?.nome || "").toLowerCase() === nome.toLowerCase()) {
      return mapUser(key, val);
    }
  }
  return null;
}

// ---------- Login ----------
/**
 * login(username, password)
 * - Primeiro tenta ler app/users/<username>
 * - Se não existir, tenta localizar por campo "nome"
 * - Valida "ativo" e "password"
 * - Grava sessão minimalista: { uid, username, role }
 */
export async function login(username, password) {
  const u = String(username || "").trim();
  const p = String(password || "");

  if (!u || !p) throw new Error("Informe usuário e senha.");

  // 1) tenta por chave do nó
  let user = await fetchUserByUsernameKey(u);

  // 2) fallback: nome
  if (!user) user = await fetchUserByNome(u);

  if (!user) throw new Error("Usuário não encontrado.");
  if (!user.active) throw new Error("Usuário inativo.");
  if (user.password !== p) throw new Error("Senha inválida.");

  setSession({ uid: user.id, username: user.username, role: user.role });
  return user;
}
