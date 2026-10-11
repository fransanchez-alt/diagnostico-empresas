// Guarda los casos en IndexedDB (solo en este dispositivo). Si no está disponible, usa la memoria.
const DB = 'diagnostico-empresas', STORE = 'casos';
let memoria = new Map();
let dbPromesa = null;

function abrir() {
  if (dbPromesa) return dbPromesa;
  dbPromesa = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) { resolve(null); }
  });
  return dbPromesa;
}

function tx(db, modo, fn) {
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, modo);
    const r = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(r && r.result);
    t.onerror = () => reject(t.error);
  });
}

export async function listar() {
  const db = await abrir();
  if (!db) return [...memoria.values()];
  return new Promise((resolve) => {
    const out = [];
    const req = db.transaction(STORE).objectStore(STORE).openCursor();
    req.onsuccess = () => { const c = req.result; if (c) { out.push(c.value); c.continue(); } else resolve(out); };
    req.onerror = () => resolve(out);
  });
}

export async function obtener(id) {
  const db = await abrir();
  if (!db) return memoria.get(id) || null;
  return new Promise((resolve) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

export async function guardar(caso) {
  caso.actualizado = new Date().toISOString();
  const copia = JSON.parse(JSON.stringify(caso));
  const db = await abrir();
  if (!db) { memoria.set(copia.id, copia); return; }
  await tx(db, 'readwrite', (s) => s.put(copia));
}

export async function borrar(id) {
  const db = await abrir();
  if (!db) { memoria.delete(id); return; }
  await tx(db, 'readwrite', (s) => s.delete(id));
}

export function preferencia(clave, valor) {
  try {
    if (valor === undefined) return localStorage.getItem('dx-' + clave);
    localStorage.setItem('dx-' + clave, valor);
  } catch (e) { return null; }
  return valor;
}
