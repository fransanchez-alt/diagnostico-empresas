// Genera los archivos del arnés para una tarjeta (pura: sin DOM ni red).
import { costeTarjeta, etiquetaCoste, cuadrante, umbralMatriz, ordenFinal, areasEnJuego, clasificarAreas, CUADRANTES, fmt } from './logic.js';

// Archivo de plantilla → ruta dentro del kit. "ligero" indica si va también en el kit ligero.
export const MAPA_KIT = [
  { plantilla: 'AGENTS.md', ruta: 'AGENTS.md', ligero: true },
  { plantilla: 'cliente.md', ruta: 'docs/cliente.md', ligero: true },
  { plantilla: 'diagnostico.md', ruta: 'docs/diagnostico.md', ligero: true },
  { plantilla: 'requisitos.md', ruta: 'docs/requisitos.md', ligero: false },
  { plantilla: 'aceptacion.md', ruta: 'specs/aceptacion.md', ligero: false },
  { plantilla: 'ejemplos.md', ruta: 'specs/ejemplos.md', ligero: false },
  { plantilla: 'actual.md', ruta: 'progress/actual.md', ligero: true },
  { plantilla: 'lecciones.md', ruta: 'progress/lecciones.md', ligero: true },
  { plantilla: 'commands/plan.md', ruta: '.opencode/commands/plan.md', ligero: true },
  { plantilla: 'commands/verificar.md', ruta: '.opencode/commands/verificar.md', ligero: true },
  { plantilla: 'commands/cerrar.md', ruta: '.opencode/commands/cerrar.md', ligero: true },
  { plantilla: 'tests-LEEME.md', ruta: 'tests/README.md', ligero: false },
  { plantilla: 'init.sh', ruta: 'init.sh', ligero: false },
  { plantilla: 'datos-LEEME.md', ruta: 'datos/LEEME.md', ligero: true }
];

export const PLANTILLAS = MAPA_KIT.map((m) => m.plantilla);

const P = (txt) => `[PENDIENTE: ${txt}]`;
const o = (v, txt) => (v && String(v).trim() ? String(v).trim() : P(txt));

export function variablesKit(caso, t, ctx) {
  const { areas, motivos, patrones, base } = ctx;
  const pat = patrones.find((p) => p.id === t.patron);
  const area = areas.find((a) => a.id === t.area);
  const dest = base.destinos.find((d) => d.id === t.destino);
  const r = caso.respuestas || {};
  const c = costeTarjeta(t);
  const umb = umbralMatriz(caso);
  const q = cuadrante(t, umb.valor, caso.tarjetas || []);
  const orden = ordenFinal(caso, patrones).items;
  const pos = orden.find((i) => i.id === t.id);
  const st = (caso.areas || {})[t.area] || {};
  const inds = area ? area.indicadores.map((i) => ({ ...i, ...(st.indicadores || {})[i.id] })).filter((i) => i.valor !== undefined && i.valor !== '') : [];
  const indicador = inds.length
    ? inds.map((i) => `${i.nombre}: de ${i.valor} a ${o(i.objetivo, 'valor objetivo')} ${i.unidad}`).join('; ')
    : (area ? `${area.nombre}: del nivel ${o(st.nivel, 'nivel actual')} al ${o(st.objetivo, 'nivel objetivo')} ${P('indicador medible')}` : P('indicador medible'));

  const enJuego = areasEnJuego(caso, motivos, areas);
  const cl = clasificarAreas(caso, enJuego, areas);
  const nombreArea = (id) => (areas.find((a) => a.id === id) || {}).nombre || id;
  const tablaAreas = ['| Área | A | B | Brecha | Importancia |', '|---|---|---|---|---|']
    .concat(cl.filas.filter((f) => f.estado !== 'no explorada').map((f) => `| ${nombreArea(f.id)} | ${f.nivel ?? f.estado} | ${f.objetivo ?? '—'} | ${f.brecha ?? '—'} | ${f.importancia || '—'} |`)).join('\n');

  const pendientes = [];
  c.partes.forEach((p) => p.faltan.forEach((f) => pendientes.push(`Dato que falta para el coste: ${f}.`)));
  (c.partes.flatMap((p) => p.operacion.match(/\[PENDIENTE: [^\]]+\]/g) || [])).forEach((x) => pendientes.push(x.replace(/\[PENDIENTE: ([^\]]+)\]/, 'Dato que falta: $1.')));
  if (!t.primerPaso) pendientes.push('Definir el primer paso concreto.');
  if (pat && !(caso.areas || {})[t.area]) pendientes.push('Explorar el área del problema.');

  const lista = (txt) => String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean);
  return {
    EMPRESA: o(caso.empresa && caso.empresa.nombre, 'nombre de la empresa'),
    SECTOR: o(caso.empresa && caso.empresa.sector, 'sector'),
    ACTIVIDAD: o(r.M1, 'actividad de la empresa'),
    PROBLEMA: o(t.titulo, 'problema'),
    OBJETIVO_PROYECTO: o(t.solucion, 'objetivo del proyecto'),
    OBJETIVO_GENERAL: o(caso.objetivoGeneral, 'objetivo general'),
    AREA: area ? area.nombre : P('área'),
    DOLOR: t.dolor || '—',
    COSTE: etiquetaCoste(t),
    OPERACIONES: c.partes.length ? c.partes.map((p) => `- ${p.operacion}${p.hipotesis ? ' (incluye supuestos)' : ''}`).join('\n') : '- Sin cálculo.',
    CUADRANTE: `${CUADRANTES[q.clave].titulo}. ${q.frase}`,
    POSICION: pos ? `${pos.posicion}.º · ${pos.porque}${pos.ajustada ? ` Ajustado por el consultor: ${pos.motivoAjuste}` : ''}` : 'Fuera del orden (no viable ahora o no se aborda).',
    INDICADOR: indicador,
    RESTRICCIONES: [r.M8 && `presupuesto: ${r.M8}`, r.M9 && `no se toca: ${r.M9}`].filter(Boolean).join('; ') || P('restricciones del cliente'),
    STACK: pat ? pat.stack : P('stack'),
    PATRON: pat ? `${pat.id} · ${pat.nombre}` : 'Sin patrón',
    DESTINO: dest ? dest.nombre : P('destino'),
    FECHA: new Date().toISOString().slice(0, 10),
    PRIMER_PASO: o(t.primerPaso, 'primer paso concreto'),
    DATOS: o(t.datos, 'qué datos hacen falta'),
    RESPUESTAS: Object.entries(r).filter(([, v]) => v).map(([k, v]) => `- **${k}.** ${v}`).join('\n') || P('respuestas de la empresa'),
    CANVAS: base.canvas.map((b) => `- **${b.nombre}:** ${o((caso.canvas || {})[b.id], b.nombre.toLowerCase())}`).join('\n'),
    MOTIVOS: (caso.motivos || []).map((id) => `- ${(motivos.find((m) => m.id === id) || {}).titulo || id}`).join('\n') || P('motivo de consulta'),
    PORQUES: (caso.porques || []).filter(Boolean).map((p, i) => `${i + 1}. ${p}`).join('\n') || P('5 porqués'),
    AREAS: tablaAreas,
    CRUCES: base.cruces.filter((x) => (caso.cruces || {})[x.id] && caso.cruces[x.id].ok)
      .map((x) => `- **${x.nombre}:** ${caso.cruces[x.id].ev1 || '—'} · ${caso.cruces[x.id].ev2 || '—'}`).join('\n') || '- Ninguno confirmado.',
    INVENTARIO: (caso.inventario || []).length
      ? ['| Fuente | Contenido | Quién | ¿Existe? | ¿Completa? | ¿Fiable? | Pistas |', '|---|---|---|---|---|---|---|']
        .concat(caso.inventario.map((d) => `| ${d.fuente} | ${d.contenido || ''} | ${d.quien || ''} | ${d.existe || '?'} | ${d.completa || '?'} | ${d.fiable || '?'} | ${d.pistas || ''} |`)).join('\n')
      : '- Sin inventario.',
    NOTOCAR: lista(caso.noTocar).map((x) => `- ${x}`).join('\n') || '- [PENDIENTE]',
    RFS: pat ? pat.rfs.map((x, i) => `| RF-${String(i + 1).padStart(2, '0')} | ${x} | M |`).join('\n') : `| RF-01 | ${P('requisito')} | M |`,
    CAS: pat ? pat.ca.map((x, i) => `| CA-${String(i + 1).padStart(2, '0')} | ${x[0]} | ${x[1]} | ${x[2]} |`).join('\n') : `| CA-01 | ${P('dado')} | ${P('cuando')} | ${P('entonces')} |`,
    EJEMPLOS: pat ? pat.ejemplos : P('tabla de ejemplos'),
    UMBRAL: pat ? pat.umbral : P('umbral'),
    RIESGOS: pat ? pat.riesgos.map((x) => `- ${x}`).join('\n') : P('riesgos'),
    PENDIENTES: pendientes.length ? pendientes.map((x, i) => `${i + 1}. ${x}`).join('\n') : '- Nada pendiente.'
  };
}

export function rellenar(plantilla, vars) {
  return plantilla.replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `[PENDIENTE: ${k}]`));
}

// Devuelve { ruta: contenido } con todos los archivos del kit.
export function generarKit(caso, t, ctx, plantillas, skills) {
  const vars = variablesKit(caso, t, ctx);
  const ligero = t.destino === 'asiste';
  const out = {};
  MAPA_KIT.forEach((m) => {
    if (ligero && !m.ligero) return;
    out[m.ruta] = rellenar(plantillas[m.plantilla] || '', vars);
  });
  const pat = ctx.patrones.find((p) => p.id === t.patron);
  if (!ligero && pat && skills[pat.slug]) out[`.agents/skills/${pat.slug}/SKILL.md`] = skills[pat.slug];
  out['LEEME.md'] = `# Kit del arnés · ${vars.PROBLEMA}\n\nGenerado por la herramienta de diagnóstico el ${vars.FECHA}.\n\n1. Abre esta carpeta con OpenCode.\n2. Lee AGENTS.md y docs/requisitos.md.\n3. Completa los [PENDIENTE] con el cliente.\n4. Empieza con /plan.\n`;
  return out;
}

export function nombreKit(caso, t) {
  const limpio = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return `kit-${limpio(caso.empresa && caso.empresa.nombre)}-${limpio(t.titulo)}`;
}

export { fmt };
