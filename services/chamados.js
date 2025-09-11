// /services/chamados.js
// CRUD de Chamados usando Realtime Database em app/chamados
// Mapeamento para UI:
// - titulo      ← chamado
// - descricao   ← cenario (concat com equipamento/linha para exibir melhor)
// - status      ← deleted ? "Fechado" : "Aberto"
// - prioridade  ← (opcional) campo salvo em RTDB se informado
// - criadoPor   ← analista
// - criadoEm    ← createdAt (epoch ms)

import { rtdb } from "../config/firebase_config.js";
import {
  ref, get, child, push, set, update, remove
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { getSession } from "./auth.js";

const ROOT = "app/chamados";

// ---------- Helpers ----------
const toStr = (v) => (v == null ? "" : String(v));

function mapToUI(id, c) {
  const titulo = toStr(c.chamado) || "(sem título)";
  const partes = [];
  if (c.cenario) partes.push(`Cenário: ${toStr(c.cenario)}`);
  if (c.equipamento) partes.push(`Equip: ${toStr(c.equipamento)}`);
  if (c.linha) partes.push(`Linha: ${toStr(c.linha)}`);
  const descricao = partes.join(" • ") || toStr(c.cenario) || "";

  const prioridade = c.prioridade ? toStr(c.prioridade) : "Média"; // default
  const status = c.deleted ? "Fechado" : "Aberto";
  const criadoEm = c.createdAt ?? null;
  const criadoPor = { username: c.analista || "-" };

  return { id, titulo, descricao, prioridade, status, criadoPor, criadoEm };
}

function normalizeForSave({ titulo, descricao, prioridade, status }, user) {
  return {
    chamado: toStr(titulo),
    cenario: toStr(descricao),
    equipamento: "",     // pode ser preenchido via UI se quiser
    linha: "",           // idem
    prioridade: prioridade ? toStr(prioridade) : undefined, // opcional no RTDB
    deleted: status === "Fechado",
    createdAt: Date.now(),
    analista: user?.username || "desconhecido",
    isDuplicate: false
  };
}

// ---------- API ----------
export async function listChamados({ busca = "", status = "", prioridade = "" } = {}) {
  const snap = await get(child(ref(rtdb), ROOT));
  const obj = snap.exists() ? snap.val() : {};
  const arr = Object.entries(obj).map(([id, c]) => mapToUI(id, c));

  const qBusca = busca.trim().toLowerCase();

  const filtered = arr.filter(c =>
    (!qBusca || c.titulo.toLowerCase().includes(qBusca) || c.descricao.toLowerCase().includes(qBusca)) &&
    (!status || c.status === status) &&
    (!prioridade || c.prioridade === prioridade)
  );

  // Ordena por criadoEm desc (se houver), senão por título
  filtered.sort((a, b) => {
    const ta = Number(a.criadoEm || 0);
    const tb = Number(b.criadoEm || 0);
    if (tb !== ta) return tb - ta;
    return a.titulo.localeCompare(b.titulo, "pt-BR");
  });

  return filtered;
}

export async function createChamado({ titulo, descricao, prioridade = "Média", status = "Aberto" }) {
  const user = getSession();
  if (!user) throw new Error("Sessão expirada.");

  const novo = normalizeForSave({ titulo, descricao, prioridade, status }, user);
  const key = push(ref(rtdb, ROOT)).key;
  await set(ref(rtdb, `${ROOT}/${key}`), novo);
  return mapToUI(key, novo);
}

export async function updateChamado(id, fields) {
  // Mapeia apenas os campos suportados pelo RTDB
  const patch = {};
  if (fields.titulo != null) patch["chamado"] = toStr(fields.titulo);
  if (fields.descricao != null) patch["cenario"] = toStr(fields.descricao);
  if (fields.status != null) patch["deleted"] = fields.status === "Fechado";
  if (fields.prioridade != null) patch["prioridade"] = toStr(fields.prioridade); // opcional

  // Se quiser permitir editar equipamento/linha:
  if (fields.equipamento != null) patch["equipamento"] = toStr(fields.equipamento);
  if (fields.linha != null) patch["linha"] = toStr(fields.linha);

  if (Object.keys(patch).length === 0) return; // nada a fazer
  await update(ref(rtdb, `${ROOT}/${id}`), patch);
}

export async function deleteChamado(id) {
  await remove(ref(rtdb, `${ROOT}/${id}`));
}
