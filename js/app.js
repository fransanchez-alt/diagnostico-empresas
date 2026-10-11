// Herramienta de diagnóstico A → B · interfaz
import * as L from './logic.js';
import * as S from './store.js';
import { generarFormulario, leerRespuestas, preguntasFormulario, esc } from './formulario.js';
import { radarSVG, leyendaRadar } from './radar.js';
import { generarKit, nombreKit, PLANTILLAS } from './kit.js';
import { crearZip } from './zip.js';

const PASOS = [
  { id: 'motivo', n: 1, titulo: 'Motivo de consulta' },
  { id: 'exploracion', n: 2, titulo: 'Exploración' },
  { id: 'analitica', n: 3, titulo: 'Analítica' },
  { id: 'diagnostico', n: 4, titulo: 'Diagnóstico' },
  { id: 'tratamiento', n: 5, titulo: 'Tratamiento' },
  { id: 'informe', n: 6, titulo: 'Informe' }
];

const C = {}; // contenido del método
let caso = null;
let guardarTimer = null;
const $app = () => document.getElementById('app');

// ---------- Arranque ----------

async function cargarContenido() {
  const j = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p); return r.json(); });
  const t = (p) => fetch(p).then((r) => (r.ok ? r.text() : ''));
  [C.areas, C.motivos, C.base, C.formulas, C.patrones, C.ayudas] = await Promise.all(
    ['areas', 'motivos', 'base', 'formulas', 'patrones', 'ayudas'].map((n) => j(`content/${n}.json`)));
  C.plantillas = {};
  await Promise.all(PLANTILLAS.map(async (p) => { C.plantillas[p] = await t(`content/kit/${p}`); }));
  C.skills = {};
  await Promise.all(C.patrones.map(async (p) => { C.skills[p.slug] = await t(`content/skills/${p.slug}.md`); }));
}

async function iniciar() {
  try { await cargarContenido(); }
  catch (e) {
    $app().innerHTML = `<div class="tarjeta aviso-rojo"><h2>No se pudo cargar el método</h2><p>Abre la herramienta desde su dirección web (no haciendo doble clic en el archivo). Detalle: ${esc(e.message)}</p></div>`;
    return;
  }
  document.body.classList.toggle('sin-ayudas', S.preferencia('ayudas') === 'no');
  window.addEventListener('hashchange', ruta);
  document.addEventListener('input', alEscribir);
  document.addEventListener('change', alCambiar);
  document.addEventListener('click', alPulsar);
  document.addEventListener('toggle', (e) => { const d = e.target; if (d.dataset && d.dataset.ayuda) { S.preferencia('ayuda-' + d.dataset.ayuda, d.open ? 'abierta' : 'cerrada'); const s = d.querySelector('summary .enlace'); if (s) s.textContent = d.open ? 'Plegar' : 'Desplegar'; } }, true);
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  ruta();
}

async function ruta() {
  const dlg = document.getElementById('dialogo'); if (dlg && dlg.open) dlg.close();
  const partes = location.hash.replace(/^#\/?/, '').split('/');
  if (partes[0] === 'c' && partes[1]) {
    if (!caso || caso.id !== partes[1]) caso = await S.obtener(decodeURIComponent(partes[1]));
    if (!caso) { location.hash = '#/'; return; }
    const paso = PASOS.find((p) => p.id === partes[2]) ? partes[2] : 'motivo';
    pintarCaso(paso);
  } else {
    caso = null;
    pintarInicio();
  }
}

function ir(paso) { location.hash = `#/c/${encodeURIComponent(caso.id)}/${paso}`; }

// ---------- Utilidades de datos ----------

function getPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function setPath(obj, path, val) {
  const ks = path.split('.');
  let o = obj;
  ks.slice(0, -1).forEach((k, i) => {
    if (o[k] == null || typeof o[k] !== 'object') o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    o = o[k];
  });
  o[ks[ks.length - 1]] = val;
}
function programarGuardado() {
  clearTimeout(guardarTimer);
  guardarTimer = setTimeout(() => { if (caso) S.guardar(caso).then(() => aviso('Guardado')); }, 350);
}
function aviso(txt) {
  const el = document.getElementById('estado-guardado');
  if (el) { el.textContent = txt; el.classList.add('visible'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('visible'), 1200); }
}
const val = (path, def = '') => { const v = caso ? getPath(caso, path) : undefined; return v == null ? def : v; };
const enJuego = () => L.areasEnJuego(caso, C.motivos, C.areas);
const areaNombre = (id) => (C.areas.find((a) => a.id === id) || {}).nombre || '—';
const nuevoId = (pref) => `${pref}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

// ---------- Componentes ----------

function campo({ etiqueta, path, tipo = 'text', ph = '', ayuda = '', rr = false, filas = 3, ancho = '' }) {
  const v = esc(val(path));
  const extra = `data-bind="${path}"${rr ? ' data-rr="1"' : ''}`;
  const ctrl = tipo === 'area'
    ? `<textarea ${extra} rows="${filas}" placeholder="${esc(ph)}">${v}</textarea>`
    : `<input type="${tipo === 'num' ? 'text' : tipo}" inputmode="${tipo === 'num' ? 'decimal' : 'text'}" ${extra} value="${v}" placeholder="${esc(ph)}">`;
  return `<label class="campo ${ancho}"><span class="et">${etiqueta}</span>${ctrl}${ayuda ? `<span class="ay">${ayuda}</span>` : ''}</label>`;
}

function selector({ etiqueta, path, opciones, rr = true, ayuda = '' }) {
  const v = String(val(path));
  return `<label class="campo"><span class="et">${etiqueta}</span><select data-bind="${path}"${rr ? ' data-rr="1"' : ''}>
    ${opciones.map(([k, t]) => `<option value="${esc(k)}"${String(k) === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}
  </select>${ayuda ? `<span class="ay">${ayuda}</span>` : ''}</label>`;
}

function g(termino, texto = termino) {
  return `<button type="button" class="term" data-action="glosario" data-term="${esc(termino)}" aria-label="Qué significa ${esc(termino)}">${esc(texto)}<span aria-hidden="true">?</span></button>`;
}

function ayuda(paso) {
  const a = C.ayudas[paso];
  if (!a) return '';
  const abierta = S.preferencia('ayuda-' + paso) !== 'cerrada';
  return `<details class="ayuda" data-ayuda="${paso}"${abierta ? ' open' : ''}><summary class="ayuda-cab"><strong>ⓘ Cómo funciona este paso</strong>
    <span class="enlace">${abierta ? 'Plegar' : 'Desplegar'}</span></summary>
    <dl><dt>Qué hacemos aquí</dt><dd>${esc(a.que)}</dd><dt>Por qué importa</dt><dd>${esc(a.porque)}</dd>
    <dt>Cómo se hace</dt><dd>${esc(a.como)}</dd><dt>Ejemplo</dt><dd>${esc(a.ejemplo)}</dd></dl>
    <p><button type="button" class="enlace" data-action="toggle-ayudas">Ocultar todas las ayudas</button></p></details>`;
}

function origenSel(path) {
  const v = val(path, 'E');
  return `<select class="origen" data-bind="${path}" data-rr="1" aria-label="Origen del dato">
    ${[['E', '[E] empresa'], ['C', '[C] consultor'], ['S', '[S] supuesto']].map(([k, t]) => `<option value="${k}"${k === v ? ' selected' : ''}>${t}</option>`).join('')}</select>`;
}

// ---------- Inicio ----------

async function pintarInicio() {
  const casos = (await S.listar()).sort((a, b) => (b.actualizado || '').localeCompare(a.actualizado || ''));
  $app().innerHTML = `
  <section class="portada">
    <h1>Diagnóstico de empresas <span class="ab">A → B</span></h1>
    <p class="lead">Dónde está la empresa, dónde quiere llegar y qué hacer primero. Termina en el arnés para construir la solución con OpenCode.</p>
  </section>
  ${ayuda('inicio')}
  <div class="botonera">
    <button class="btn primario" data-action="nuevo-caso">+ Nuevo caso</button>
    <button class="btn" data-action="abrir-ejemplo">Abrir el ejemplo Hidrotex</button>
    <label class="btn">Importar un caso<input type="file" accept=".json,application/json" data-action-file="importar-caso" hidden></label>
  </div>
  <h2>Tus casos</h2>
  ${casos.length ? `<div class="lista-casos">${casos.map((c) => `
    <article class="tarjeta caso">
      <div><h3>${esc(c.empresa?.nombre || 'Sin nombre')}${c.ejemplo ? ' <span class="chip">ejemplo</span>' : ''}</h3>
      <p class="mudo">${esc(c.empresa?.sector || '')} · actualizado ${new Date(c.actualizado).toLocaleDateString('es-ES')}</p></div>
      <div class="acciones">
        <a class="btn primario" href="#/c/${encodeURIComponent(c.id)}/motivo">Abrir</a>
        <button class="btn" data-action="exportar-caso" data-id="${esc(c.id)}">Exportar</button>
        <button class="btn peligro" data-action="borrar-caso" data-id="${esc(c.id)}">Borrar</button>
      </div>
    </article>`).join('')}</div>` : '<p class="mudo">Todavía no hay casos. Crea uno o abre el ejemplo.</p>'}
  <p class="privacidad">🔒 Los casos se guardan solo en este dispositivo. No se envía nada a ningún servidor.</p>`;
}

// ---------- Caso ----------

function pintarCaso(paso) {
  const i = PASOS.findIndex((p) => p.id === paso);
  const contenido = { motivo: vMotivo, exploracion: vExploracion, analitica: vAnalitica, diagnostico: vDiagnostico, tratamiento: vTratamiento, informe: vInforme }[paso]();
  const y = window.scrollY;
  const mismoPaso = $app().dataset.paso === paso && $app().dataset.caso === caso.id;
  $app().dataset.paso = paso; $app().dataset.caso = caso.id;
  $app().innerHTML = `
  <div class="cab-caso no-print">
    <a href="#/" class="enlace">← Casos</a>
    <strong class="nombre-caso">${esc(caso.empresa.nombre || 'Sin nombre')}</strong>
  </div>
  <nav class="linea no-print" aria-label="Pasos del diagnóstico">
    ${PASOS.map((p, k) => `<a href="#/c/${encodeURIComponent(caso.id)}/${p.id}" class="estacion${p.id === paso ? ' activa' : ''}${k < i ? ' hecha' : ''}"${p.id === paso ? ' aria-current="step"' : ''}><span class="num">${p.n}</span><span class="tit">${p.titulo}</span></a>`).join('')}
  </nav>
  <section class="paso">
    <h1>${PASOS[i].n} · ${PASOS[i].titulo}</h1>
    ${ayuda(paso)}
    ${contenido}
  </section>
  <div class="pie-paso no-print">
    ${i > 0 ? `<button class="btn" data-action="ir" data-paso="${PASOS[i - 1].id}">← ${PASOS[i - 1].titulo}</button>` : '<span></span>'}
    ${i < PASOS.length - 1 ? `<button class="btn primario" data-action="ir" data-paso="${PASOS[i + 1].id}">${PASOS[i + 1].titulo} →</button>` : ''}
  </div>`;
  if (mismoPaso) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

function repintar() { const paso = $app().dataset.paso; if (caso && paso) pintarCaso(paso); }

// ---------- Paso 1 · Motivo ----------

function vMotivo() {
  const juego = enJuego();
  const motivosHtml = C.motivos.map((m) => {
    const on = (caso.motivos || []).includes(m.id);
    return `<label class="opcion${on ? ' on' : ''}"><input type="checkbox" data-toggle="motivos" value="${m.id}"${on ? ' checked' : ''}>
      <span><strong>${esc(m.titulo)}</strong><span class="mudo">Áreas: ${m.areas.length ? m.areas.map(areaNombre).join(', ') : 'las eliges tú'}</span>
      <span class="trampa">Trampa típica: ${esc(m.trampa)}</span></span></label>`;
  }).join('');
  const manual = C.areas.map((a) => {
    const on = (caso.areasManual || []).includes(a.id);
    return `<label class="pill${on ? ' on' : ''}"><input type="checkbox" data-toggle="areasManual" value="${a.id}"${on ? ' checked' : ''}>${esc(a.nombre)}</label>`;
  }).join('');
  const { bloques } = preguntasFormulario(caso, { base: C.base, motivos: C.motivos, areas: C.areas, enJuego: juego });
  const preguntas = bloques.map((b) => `<h3>${esc(b.titulo)}</h3>${b.preguntas.map((p) => campo({ etiqueta: `<span class="cod">${p.id}</span> ${esc(p.texto)}`, path: `respuestas.${p.id}`, tipo: 'area', filas: 2 })).join('')}`).join('');
  const exploraciones = (caso.motivos || []).map((id) => C.motivos.find((m) => m.id === id)).filter(Boolean)
    .map((m) => `<li><strong>${esc(m.titulo)}:</strong> ${esc(m.exploracion)}</li>`).join('');

  return `
  <div class="tarjeta">
    <h2>La empresa</h2>
    <div class="rejilla-2">
      ${campo({ etiqueta: 'Nombre', path: 'empresa.nombre', rr: true })}
      ${campo({ etiqueta: 'Sector', path: 'empresa.sector' })}
      ${campo({ etiqueta: 'Facturación anual aproximada (€, opcional)', path: 'empresa.facturacion', tipo: 'num', rr: true, ayuda: 'Sirve para fijar qué es «mucho dinero» en esta empresa (el 1 %).' })}
    </div>
  </div>

  <div class="tarjeta">
    <h2>¿Qué le pasa? Motivo de consulta</h2>
    <p class="mudo">Elige uno o varios. Cada motivo trae sus áreas y sus preguntas.</p>
    <div class="opciones">${motivosHtml}</div>
    <h3>Añadir áreas a mano</h3>
    <div class="pills">${manual}</div>
    <label class="interruptor"><input type="checkbox" data-bind="chequeoGeneral" data-rr="1"${caso.chequeoGeneral ? ' checked' : ''}> Hacer también el chequeo general de las 8 áreas (una pregunta por área)</label>
    <p class="resumen">Áreas que se van a explorar: <strong>${juego.length ? juego.map(areaNombre).join(', ') : 'ninguna todavía'}</strong></p>
  </div>

  <div class="tarjeta">
    <h2>Lo que cuenta el empresario</h2>
    <p>Puedes mandarle el cuestionario antes de la visita o contestarlo aquí con él (modo entrevista).</p>
    <div class="botonera">
      <button class="btn primario" data-action="generar-formulario">Descargar cuestionario para el empresario</button>
      <button class="btn" data-action="importar-respuestas">Importar sus respuestas</button>
    </div>
    ${caso.origenRespuestas ? `<p class="mudo">Respuestas: ${caso.origenRespuestas === 'empresario' ? 'contestadas por el empresario' : 'tomadas en entrevista'}.</p>` : ''}
    <details${Object.keys(caso.respuestas || {}).length ? ' open' : ''}><summary>Ver o rellenar las respuestas aquí</summary>${preguntas}</details>
  </div>

  <div class="tarjeta">
    <h2>Canvas de modelo de negocio</h2>
    <p class="mudo">Una línea por bloque. Sirve para ver dónde gana y dónde pierde dinero la empresa.</p>
    <div class="rejilla-3">${C.base.canvas.map((b) => campo({ etiqueta: b.nombre, path: `canvas.${b.id}`, ph: b.ayuda })).join('')}</div>
  </div>

  <div class="tarjeta">
    <h2>5 porqués</h2>
    <p class="mudo">Del síntoma a la causa. Escribe el problema y pregunta «¿por qué?» hasta llegar al fondo.</p>
    ${[0, 1, 2, 3, 4].map((k) => campo({ etiqueta: k === 0 ? 'Problema' : `¿Por qué? (${k})`, path: `porques.${k}` })).join('')}
    ${exploraciones ? `<h3>Qué mirar en la visita</h3><ul>${exploraciones}</ul>` : ''}
  </div>`;
}

// ---------- Paso 2 · Exploración ----------

function vExploracion() {
  const juego = enJuego();
  if (!juego.length) return `<div class="tarjeta"><p>Primero elige un motivo de consulta o añade áreas en el paso 1.</p><button class="btn primario" data-action="ir" data-paso="motivo">Ir al paso 1</button></div>`;
  const resto = C.areas.filter((a) => !juego.includes(a.id));
  return juego.map((id) => tarjetaArea(C.areas.find((a) => a.id === id))).join('') +
    (resto.length ? `<div class="tarjeta"><h3>Explorar otra área</h3><div class="pills">${resto.map((a) => `<label class="pill"><input type="checkbox" data-toggle="areasManual" value="${a.id}">${esc(a.nombre)}</label>`).join('')}</div></div>` : '');
}

function tarjetaArea(a) {
  const p = `areas.${a.id}`;
  const st = val(p, {});
  const tieneEv = !!(st.evidencia && String(st.evidencia).trim());
  const auto = st.autonivel ? `<p class="auto">La empresa se ve en el <strong>nivel ${esc(st.autonivel)}</strong>${st.nivel && Number(st.nivel) < Number(st.autonivel) ? ` · tú lo sitúas más bajo: posible ${g('Cruce')}` : ''}.</p>` : '';
  return `<details class="tarjeta area" open>
    <summary><h2>${esc(a.nombre)}</h2><span class="estado-area">${st.noAplica ? 'No aplica' : st.sinDatos ? 'Sin datos' : st.nivel ? `Nivel ${esc(st.nivel)}` : 'Sin puntuar'}</span></summary>
    <p class="mudo">${esc(a.que)}</p>
    ${campo({ etiqueta: 'Evidencia: lo que te han dicho o has visto', path: `${p}.evidencia`, tipo: 'area', filas: 2, ph: 'Sin evidencia no se guarda el nivel' })}
    <fieldset class="niveles" data-area="${a.id}"><legend>Nivel actual (${g('Punto A')})</legend>
      ${!tieneEv ? '<p class="aviso-suave" data-sin-ev>Escribe primero la evidencia para poder elegir el nivel.</p>' : ''}
      ${a.niveles.map((n, i) => `<label class="nivel${String(st.nivel) === String(i + 1) ? ' on' : ''}"><input type="radio" name="nivel-${a.id}" value="${i + 1}" data-bind="${p}.nivel" data-rr="1"${String(st.nivel) === String(i + 1) ? ' checked' : ''}${tieneEv ? '' : ' disabled'}><span class="n">${i + 1}</span><span>${esc(n)}</span></label>`).join('')}
    </fieldset>
    ${auto}
    <div class="rejilla-2">
      <label class="interruptor"><input type="checkbox" data-bind="${p}.sinDatos" data-rr="1"${st.sinDatos ? ' checked' : ''}> ${g('Sin datos')}</label>
      <label class="interruptor"><input type="checkbox" data-bind="${p}.noAplica" data-rr="1"${st.noAplica ? ' checked' : ''}> ${g('No aplica')}</label>
    </div>
    <h3>${g('Indicador', 'Indicadores')}</h3>
    ${a.indicadores.map((ind) => `<div class="fila-ind"><span class="et">${esc(ind.nombre)} <span class="mudo">(${esc(ind.unidad)})</span></span>
      <input type="text" inputmode="decimal" data-bind="${p}.indicadores.${ind.id}.valor" value="${esc(val(`${p}.indicadores.${ind.id}.valor`))}" placeholder="valor hoy" aria-label="${esc(ind.nombre)}: valor hoy">
      ${origenSel(`${p}.indicadores.${ind.id}.origen`)}</div>`).join('')}
    ${campo({ etiqueta: 'Qué haría falta para subir un nivel', path: `${p}.subir`, ph: 'Una frase concreta' })}
  </details>`;
}

// ---------- Paso 3 · Analítica ----------

function vAnalitica() {
  const sugeridas = ['M4', 'M5'].map((k) => val(`respuestas.${k}`)).filter(Boolean);
  return `
  ${(caso.tarjetas || []).map((t, i) => tarjetaProblema(t, i)).join('')}
  <div class="botonera">
    <button class="btn primario" data-action="add-tarjeta">+ Añadir problema</button>
    ${sugeridas.length ? `<button class="btn" data-action="tarjeta-desde-m5">Crear desde lo que dijo el empresario (M5)</button>` : ''}
  </div>
  <div class="tarjeta">
    <h2>Inventario de datos</h2>
    <p class="mudo">Cada fuente de datos con su semáforo: ¿existe?, ¿está completa?, ¿es fiable?</p>
    ${(caso.inventario || []).map((d, i) => `<div class="fila-inv">
      <div class="rejilla-3">
        ${campo({ etiqueta: 'Fuente', path: `inventario.${i}.fuente` })}
        ${campo({ etiqueta: 'Qué contiene', path: `inventario.${i}.contenido` })}
        ${campo({ etiqueta: 'Quién la tiene', path: `inventario.${i}.quien` })}
      </div>
      <div class="semaforo">${['existe', 'completa', 'fiable'].map((k) => selector({ etiqueta: `¿${k[0].toUpperCase() + k.slice(1)}?`, path: `inventario.${i}.${k}`, opciones: [['', '?'], ['si', 'Sí'], ['duda', 'Dudoso'], ['no', 'No']] })).join('')}</div>
      ${campo({ etiqueta: 'Pistas de errores', path: `inventario.${i}.pistas`, tipo: 'area', filas: 2 })}
      <button class="btn peq peligro" data-action="del-inventario" data-i="${i}">Quitar fuente</button>
    </div>`).join('')}
    <button class="btn" data-action="add-inventario">+ Añadir fuente de datos</button>
  </div>`;
}

function tarjetaProblema(t, i) {
  const p = `tarjetas.${i}`;
  const coste = L.costeTarjeta(t);
  const areasOp = [['', 'Elige área']].concat(C.areas.map((a) => [a.id, a.nombre]));
  const patOp = [['', 'Sin patrón']].concat(C.patrones.map((x) => [x.id, `${x.id} · ${x.nombre}`]));
  const formOp = [['', 'Elige fórmula']].concat(C.formulas.map((f) => [f.id, `${f.id} · ${f.nombre}`]));
  return `<article class="tarjeta problema">
    <div class="cab-tarjeta"><span class="chip">${esc(t.id)}</span><strong class="coste ${coste.valor !== null ? 'con' : ''}">${esc(L.etiquetaCoste(t))}</strong></div>
    ${campo({ etiqueta: 'Problema, con palabras de la empresa', path: `${p}.titulo`, rr: true })}
    <div class="rejilla-3">
      ${selector({ etiqueta: 'Área', path: `${p}.area`, opciones: areasOp })}
      ${selector({ etiqueta: '¿Cuánto le molesta? (dolor)', path: `${p}.dolor`, opciones: [['', '—'], ['1', '1 · poco'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5 · muchísimo']] })}
      ${selector({ etiqueta: 'Viabilidad', path: `${p}.viabilidad`, opciones: [['viable', 'Viable'], ['parcial', 'Parcial: falta algo'], ['no', 'No viable ahora']] })}
    </div>
    <h3>Coste <span class="mudo">(la cuenta se hace sola)</span></h3>
    ${(t.calculos || []).map((c, k) => {
      const f = C.formulas.find((x) => x.id === c.formula);
      const r = L.calcular(c);
      return `<div class="calculo">
        <div class="cab-calc">${selector({ etiqueta: 'Fórmula', path: `${p}.calculos.${k}.formula`, opciones: formOp })}<button class="btn peq" data-action="del-calculo" data-i="${i}" data-k="${k}" aria-label="Quitar cálculo">✕</button></div>
        ${f ? `<p class="mudo">${esc(f.explica)}</p><div class="campos-calc">${f.campos.map((cp) => `<div class="campo-calc"><label class="et" for="c-${i}-${k}-${cp.id}">${esc(cp.nombre)}</label>
          <div class="par"><input id="c-${i}-${k}-${cp.id}" type="text" inputmode="decimal" data-bind="${p}.calculos.${k}.campos.${cp.id}.v" data-rr="1" value="${esc(val(`${p}.calculos.${k}.campos.${cp.id}.v`))}" placeholder="—">${origenSel(`${p}.calculos.${k}.campos.${cp.id}.o`)}</div>
          <span class="ay">${esc(cp.ayuda)}</span></div>`).join('')}</div>
        <div class="resultado${r.hipotesis ? ' hipo' : ''}"><strong>${esc(r.etiqueta || 'Sin datos')}</strong><code>${esc(r.operacion)}</code>
          ${r.hipotesis ? '<span class="nota">Incluye supuestos [S]: no va en el titular.</span>' : ''}${r.notas.map((n) => `<span class="nota">${esc(n)}</span>`).join('')}</div>` : ''}
      </div>`;
    }).join('')}
    <button class="btn peq" data-action="add-calculo" data-i="${i}">+ Añadir cálculo</button>
    <div class="rejilla-2">
      ${campo({ etiqueta: 'Datos: qué hay y en qué estado', path: `${p}.datos`, tipo: 'area', filas: 2 })}
      ${campo({ etiqueta: 'Solución: la idea, sin tecnología todavía', path: `${p}.solucion`, tipo: 'area', filas: 2 })}
    </div>
    <div class="rejilla-3">
      ${selector({ etiqueta: 'Patrón de solución', path: `${p}.patron`, opciones: patOp })}
      ${selector({ etiqueta: `${'¿Es una urgencia?'}`, path: `${p}.urgencia`, opciones: [['', 'No']].concat(C.base.urgencias.map((u) => [u, u])) })}
      <label class="interruptor"><input type="checkbox" data-bind="${p}.quickWin" data-rr="1"${t.quickWin ? ' checked' : ''}> Se nota en dos semanas (quick win)</label>
    </div>
    <button class="btn peq peligro" data-action="del-tarjeta" data-i="${i}">Eliminar problema</button>
  </article>`;
}

// ---------- Paso 4 · Diagnóstico ----------

function vDiagnostico() {
  const juego = enJuego();
  const cl = L.clasificarAreas(caso, juego, C.areas);
  const umb = L.umbralMatriz(caso);
  const ts = caso.tarjetas || [];
  const celdas = { primero: [], cifras: [], noves: [], aparcado: [], sindatos: [] };
  ts.forEach((t) => { const q = L.cuadrante(t, umb.valor, ts); celdas[q.clave].push({ t, q }); });
  const chips = (arr) => arr.map(({ t, q }) => `<div class="chip-t"><strong>${esc(t.titulo || t.id)}</strong><span>${esc(L.etiquetaCoste(t))} · dolor ${esc(t.dolor || '—')}</span><em>${esc(q.frase)}</em></div>`).join('') || '<span class="mudo">—</span>';
  const d = L.dafo(caso, juego, C.areas, C.patrones);
  const lista = (arr) => arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="mudo">—</p>';
  const sugerNoTocar = (caso.motivos || []).map((id) => (C.motivos.find((m) => m.id === id) || {}).trampa).filter(Boolean);

  return `
  <div class="tarjeta">
    <h2>A dónde queréis llegar (${g('Punto B')})</h2>
    ${campo({ etiqueta: 'Objetivo general, en palabras (concreto, medible y con fecha)', path: 'objetivoGeneral', tipo: 'area', filas: 2, ph: val('respuestas.M3') || 'Por ejemplo: no quedarnos sin stock en temporada antes de junio de 2027' })}
    <div class="tabla-b">
      ${juego.map((id) => {
        const st = val(`areas.${id}`, {});
        const a = C.areas.find((x) => x.id === id);
        return `<div class="fila-b"><div><strong>${esc(a.nombre)}</strong><span class="mudo">Hoy: ${st.noAplica ? 'no aplica' : st.nivel ? `nivel ${esc(st.nivel)}` : 'sin datos'}</span></div>
          ${selector({ etiqueta: 'Objetivo', path: `areas.${id}.objetivo`, opciones: [['', '—'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']] })}
          ${selector({ etiqueta: 'Importancia', path: `areas.${id}.importancia`, opciones: [['', '—'], ['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']] })}
          ${a.indicadores.filter((ind) => val(`areas.${id}.indicadores.${ind.id}.valor`) !== '').map((ind) => campo({ etiqueta: `${ind.nombre}: hoy ${esc(val(`areas.${id}.indicadores.${ind.id}.valor`))} → objetivo`, path: `areas.${id}.indicadores.${ind.id}.objetivo`, tipo: 'num' })).join('')}
        </div>`;
      }).join('') || '<p class="mudo">No hay áreas exploradas.</p>'}
    </div>
  </div>

  <div class="tarjeta">
    <h2>Punto A frente a punto B</h2>
    <div class="radar-caja">${radarSVG(C.areas, cl.filas)}${leyendaRadar()}</div>
    <div class="rejilla-2">
      <div><h3>Fortalezas</h3>${cl.fortalezas.length ? `<ul>${cl.fortalezas.map((id) => `<li>${esc(L.explicarArea(cl.filas.find((f) => f.id === id), areaNombre(id)))}</li>`).join('')}</ul>` : '<p class="mudo">Ninguna área está todavía en su objetivo.</p>'}</div>
      <div><h3>Debilidades</h3>${cl.debilidades.length ? `<ul>${cl.debilidades.map((id) => `<li>${esc(L.explicarArea(cl.filas.find((f) => f.id === id), areaNombre(id)))}</li>`).join('')}</ul>` : '<p class="mudo">Ninguna, o falta fijar objetivos.</p>'}</div>
    </div>
  </div>

  <div class="tarjeta">
    <h2>Lo que duele frente a lo que cuesta</h2>
    <p class="mudo">El orden lo deciden los euros; lo que duele sirve para elegir el primer quick win y para saber cómo contarlo.</p>
    ${campo({ etiqueta: `Por encima de cuántos €/año diríamos que «cuesta mucho» (ahora: ${umb.valor !== null ? L.fmt(umb.valor) + ' €, ' + umb.origen : 'sin calcular'})`, path: 'umbralManual', tipo: 'num', rr: true, ph: 'Vacío = automático' })}
    <div class="matriz">
      <div class="eje-y">Duele mucho</div>
      <div class="celda primero"><h4>Primero</h4>${chips(celdas.primero)}</div>
      <div class="celda cifras"><h4>Se explica con cifras</h4>${chips(celdas.cifras)}</div>
      <div class="eje-y">Duele poco</div>
      <div class="celda noves"><h4>Lo que no ves y te está costando</h4>${chips(celdas.noves)}</div>
      <div class="celda aparcado"><h4>Aparcado</h4>${chips(celdas.aparcado)}</div>
      <div></div><div class="eje-x">Cuesta mucho</div><div class="eje-x">Cuesta poco</div>
    </div>
    ${celdas.sindatos.length ? `<h3>Sin cifra todavía</h3><div class="sindatos">${chips(celdas.sindatos)}</div>` : ''}
  </div>

  <div class="tarjeta">
    <h2>${g('Cruce', 'Cruces')}</h2>
    <p class="mudo">Los hallazgos más valiosos salen de comparar dos fuentes. Marca los que se cumplen y escribe las dos evidencias.</p>
    ${C.base.cruces.map((x) => {
      const on = val(`cruces.${x.id}.ok`) === true;
      return `<div class="cruce${on ? ' on' : ''}"><label class="interruptor"><input type="checkbox" data-bind="cruces.${x.id}.ok" data-rr="1"${on ? ' checked' : ''}> <strong>${esc(x.nombre)}</strong></label>
        ${on ? `<div class="rejilla-2">${campo({ etiqueta: esc(x.f1), path: `cruces.${x.id}.ev1` })}${campo({ etiqueta: esc(x.f2), path: `cruces.${x.id}.ev2` })}</div>` : `<span class="mudo">${esc(x.f1)} · frente a · ${esc(x.f2)}</span>`}</div>`;
    }).join('')}
  </div>

  <div class="tarjeta">
    <h2>DAFO</h2>
    <div class="dafo">
      <div><h3>Fortalezas</h3>${lista(d.F)}${campo({ etiqueta: 'Añadir (una por línea)', path: 'fortalezasNotas', tipo: 'area', filas: 2, rr: true })}</div>
      <div><h3>Debilidades</h3>${lista(d.D)}</div>
      <div><h3>Oportunidades</h3>${lista(d.O)}${campo({ etiqueta: 'Añadir (una por línea)', path: 'oportunidades', tipo: 'area', filas: 2, rr: true })}</div>
      <div><h3>Amenazas</h3>${lista(d.A)}${campo({ etiqueta: 'Añadir (una por línea)', path: 'amenazas', tipo: 'area', filas: 2, rr: true })}</div>
    </div>
  </div>

  <div class="tarjeta">
    <h2>Lo que no conviene tocar todavía</h2>
    ${campo({ etiqueta: 'Dos o tres puntos, con su motivo (uno por línea)', path: 'noTocar', tipo: 'area', filas: 3 })}
    ${sugerNoTocar.length ? `<p class="mudo">Ideas del catálogo: ${sugerNoTocar.map(esc).join(' · ')}</p>` : ''}
  </div>`;
}

// ---------- Paso 5 · Tratamiento ----------

function vTratamiento() {
  const o = L.ordenFinal(caso, C.patrones);
  if (!o.items.length && !o.noViables.length) return `<div class="tarjeta"><p>Todavía no hay problemas. Añádelos en el paso 3.</p><button class="btn primario" data-action="ir" data-paso="analitica">Ir al paso 3</button></div>`;
  const ESC = { 1: 'Estabilizar', 2: 'Base', 3: 'Retorno' };
  const hayManual = (caso.orden?.manual || []).length > 0;
  return `
  <div class="tarjeta">
    <h2>Orden propuesto</h2>
    <p class="mudo">Regla: 1) estabilizar las urgencias, 2) las bases que otros necesitan, 3) el resto por lo que cuesta, primero lo viable. Si mueves algo, se te pedirá el motivo.</p>
    <ol class="orden">${o.items.map((it, k) => {
      const t = caso.tarjetas.find((x) => x.id === it.id);
      return `<li class="esc-${it.escalon}"><div class="pos">${it.posicion}</div><div class="cuerpo">
        <div><span class="chip esc">${ESC[it.escalon]}</span> <strong>${esc(it.titulo || it.id)}</strong> <span class="mudo">· ${esc(L.etiquetaCoste(t))}</span></div>
        <p>${esc(it.porque)}</p>${it.ajustada ? `<p class="ajuste">Ajustado por el consultor: ${esc(it.motivoAjuste)}</p>` : ''}</div>
        <div class="mover"><button class="btn peq" data-action="mover" data-id="${esc(it.id)}" data-dir="-1"${k === 0 ? ' disabled' : ''} aria-label="Subir">↑</button><button class="btn peq" data-action="mover" data-id="${esc(it.id)}" data-dir="1"${k === o.items.length - 1 ? ' disabled' : ''} aria-label="Bajar">↓</button></div></li>`;
    }).join('')}</ol>
    ${hayManual ? '<button class="btn peq" data-action="reset-orden">Volver al orden propuesto</button>' : ''}
    ${o.noViables.length ? `<h3>No viables ahora</h3><ul>${o.noViables.map((x) => `<li>${esc(x.titulo)}</li>`).join('')}</ul>` : ''}
  </div>
  ${o.items.map((it) => fichaTratamiento(caso.tarjetas.findIndex((x) => x.id === it.id), it)).join('')}`;
}

function fichaTratamiento(i, it) {
  const t = caso.tarjetas[i];
  const p = `tarjetas.${i}`;
  const pat = C.patrones.find((x) => x.id === t.patron);
  const prev = pat ? pat.requiere.map((r) => {
    const base = caso.tarjetas.find((x) => x.patron === r);
    const pr = C.patrones.find((x) => x.id === r);
    return `<li>${esc(pr ? pr.nombre : r)}: ${base ? `cubierto por «${esc(base.titulo)}»` : '<strong>falta en el plan</strong>'}</li>`;
  }) : [];
  const faltan = L.costeTarjeta(t).partes.flatMap((x) => x.faltan);
  const conKit = t.destino === 'construye' || t.destino === 'asiste';
  return `<article class="tarjeta ficha">
    <h2>${it.posicion}. ${esc(t.titulo || t.id)}</h2>
    <p class="mudo">${esc(areaNombre(t.area))} · ${esc(L.etiquetaCoste(t))} · dolor ${esc(t.dolor || '—')}</p>
    <div class="rejilla-2">
      ${selector({ etiqueta: 'Destino', path: `${p}.destino`, opciones: [['', 'Elige destino']].concat(C.base.destinos.map((d) => [d.id, d.nombre])), ayuda: esc((C.base.destinos.find((d) => d.id === t.destino) || {}).texto || '') })}
      ${selector({ etiqueta: 'Patrón de solución', path: `${p}.patron`, opciones: [['', 'Sin patrón']].concat(C.patrones.map((x) => [x.id, `${x.id} · ${x.nombre}`])), ayuda: pat ? esc(pat.verificacion) : '' })}
    </div>
    ${pat ? `<p><strong>Requisitos previos:</strong> ${esc(pat.previos)}</p>${prev.length ? `<ul>${prev.join('')}</ul>` : ''}` : ''}
    <p><strong>Restricciones:</strong> ${esc([val('respuestas.M8') && `presupuesto: ${val('respuestas.M8')}`, val('respuestas.M9') && `no se toca: ${val('respuestas.M9')}`].filter(Boolean).join(' · ') || 'sin declarar')}</p>
    ${faltan.length ? `<p><strong>Preguntas abiertas:</strong> ${esc(faltan.join('; '))}</p>` : ''}
    ${campo({ etiqueta: 'Primer paso concreto', path: `${p}.primerPaso` })}
    ${conKit ? `<button class="btn primario" data-action="descargar-kit" data-i="${i}">Descargar kit del arnés${t.destino === 'asiste' ? ' (ligero)' : ''}</button>` : t.destino === 'sinagente' ? '<p class="mudo">Sin kit: es un cambio de proceso, una herramienta existente o formación.</p>' : ''}
  </article>`;
}

// ---------- Paso 6 · Informe ----------

function vInforme() {
  const juego = enJuego();
  const cl = L.clasificarAreas(caso, juego, C.areas);
  const o = L.ordenFinal(caso, C.patrones);
  const umb = L.umbralMatriz(caso);
  const top = o.items.slice(0, 3).map((it) => {
    const t = caso.tarjetas.find((x) => x.id === it.id);
    return `<li><strong>${esc(t.titulo)}</strong> · ${esc(L.etiquetaCoste(t))}<br><span class="mudo">${esc(it.porque)} ${esc(L.cuadrante(t, umb.valor, caso.tarjetas).frase)}</span></li>`;
  }).join('');
  const d = L.dafo(caso, juego, C.areas, C.patrones);
  const lista = (arr) => arr.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="mudo">—</p>';
  const noTocar = String(caso.noTocar || '').split('\n').filter((x) => x.trim());
  return `
  <div class="botonera no-print">
    <button class="btn primario" data-action="imprimir">Imprimir / Guardar como PDF</button>
    <button class="btn" data-action="exportar-caso" data-id="${esc(caso.id)}">Exportar el caso</button>
  </div>
  <article class="informe">
    <section class="pagina">
      <header class="inf-cab"><h2>${esc(caso.empresa.nombre)}</h2><p>${esc(caso.empresa.sector || '')} · Diagnóstico del ${new Date().toLocaleDateString('es-ES')}</p></header>
      <p class="objetivo"><strong>Objetivo:</strong> ${esc(caso.objetivoGeneral || '—')}</p>
      <div class="inf-2">
        <div class="radar-caja">${radarSVG(C.areas, cl.filas)}${leyendaRadar()}</div>
        <div><h3>Qué haríamos primero</h3><ol>${top || '<li class="mudo">—</li>'}</ol>
          <h3>Fortalezas</h3><p>${cl.fortalezas.map(areaNombre).concat(d.F.filter((x) => !cl.fortalezas.map(areaNombre).includes(x))).map(esc).join(' · ') || '—'}</p>
          <h3>Debilidades</h3><p>${cl.debilidades.map(areaNombre).map(esc).join(' · ') || '—'}</p>
          <h3>Lo que no conviene tocar todavía</h3>${lista(noTocar)}</div>
      </div>
      <p class="nota-met">No se ha accedido a ningún sistema de la empresa. Las cifras salen de lo que declara la empresa [E], de lo que comprueba el consultor [C] o de supuestos [S], con la operación a la vista en el informe completo.</p>
    </section>
    <section class="pagina">
      <h2>Informe completo</h2>
      <h3>Áreas</h3>
      <table><thead><tr><th>Área</th><th>A</th><th>B</th><th>Importancia</th><th>Evidencia</th></tr></thead><tbody>
      ${cl.filas.map((f) => `<tr><td>${esc(areaNombre(f.id))}</td><td>${esc(f.nivel ?? f.estado)}</td><td>${esc(f.objetivo ?? '—')}</td><td>${esc(f.importancia || '—')}</td><td>${esc(val(`areas.${f.id}.evidencia`))}</td></tr>`).join('')}
      </tbody></table>
      <h3>Problemas y su coste</h3>
      ${(caso.tarjetas || []).map((t) => `<div class="inf-t"><strong>${esc(t.titulo)}</strong> · ${esc(areaNombre(t.area))} · dolor ${esc(t.dolor || '—')} · ${esc(L.etiquetaCoste(t))}
        ${L.costeTarjeta(t).partes.map((x) => `<code>${esc(x.operacion)}</code>`).join('')}</div>`).join('') || '<p class="mudo">—</p>'}
      <h3>Orden de prioridad</h3>
      <ol>${o.items.map((it) => `<li><strong>${esc(it.titulo)}</strong>: ${esc(it.porque)}${it.ajustada ? ` Ajustado: ${esc(it.motivoAjuste)}` : ''}</li>`).join('')}</ol>
      <h3>Cruces</h3>
      ${lista(C.base.cruces.filter((x) => val(`cruces.${x.id}.ok`) === true).map((x) => `${x.nombre}: ${val(`cruces.${x.id}.ev1`)} · ${val(`cruces.${x.id}.ev2`)}`))}
      <h3>DAFO</h3>
      <div class="dafo"><div><h4>Fortalezas</h4>${lista(d.F)}</div><div><h4>Debilidades</h4>${lista(d.D.map ? d.D : [])}</div><div><h4>Oportunidades</h4>${lista(d.O)}</div><div><h4>Amenazas</h4>${lista(d.A)}</div></div>
    </section>
  </article>`;
}

// ---------- Eventos ----------

function alEscribir(e) {
  const el = e.target;
  if (!caso || !el.dataset || !el.dataset.bind || el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT') return;
  setPath(caso, el.dataset.bind, el.value);
  programarGuardado();
  if (/\.evidencia$/.test(el.dataset.bind)) {
    const id = el.dataset.bind.split('.')[1];
    const fs = document.querySelector(`fieldset.niveles[data-area="${id}"]`);
    if (fs) {
      const ok = el.value.trim().length > 0;
      fs.querySelectorAll('input[type=radio]').forEach((r) => { r.disabled = !ok; });
      const av = fs.querySelector('[data-sin-ev]');
      if (av) av.hidden = ok;
    }
  }
}

function alCambiar(e) {
  const el = e.target;
  if (el.dataset && el.dataset.actionFile) return accionArchivo(el);
  if (!caso) return;
  if (el.dataset.toggle) {
    const arr = caso[el.dataset.toggle] || (caso[el.dataset.toggle] = []);
    const i = arr.indexOf(el.value);
    if (el.checked && i < 0) arr.push(el.value);
    if (!el.checked && i >= 0) arr.splice(i, 1);
    programarGuardado(); repintar(); return;
  }
  if (!el.dataset.bind) return;
  const v = el.type === 'checkbox' ? el.checked : el.value;
  setPath(caso, el.dataset.bind, v);
  programarGuardado();
  if (el.dataset.rr) repintar();
}

async function alPulsar(e) {
  const b = e.target.closest('[data-action]');
  if (!b || b.tagName === 'INPUT') return;
  const a = b.dataset.action;
  const acciones = {
    'ir': () => ir(b.dataset.paso),
    'toggle-ayudas': () => { const off = !document.body.classList.contains('sin-ayudas'); document.body.classList.toggle('sin-ayudas', off); S.preferencia('ayudas', off ? 'no' : 'si'); },
    'glosario': () => dialogo(b.dataset.term, `<p>${esc(C.base.glosario[b.dataset.term] || '')}</p>`),
    'nuevo-caso': nuevoCaso,
    'abrir-ejemplo': abrirEjemplo,
    'exportar-caso': () => exportarCaso(b.dataset.id),
    'borrar-caso': () => borrarCaso(b.dataset.id),
    'generar-formulario': descargarFormulario,
    'importar-respuestas': importarRespuestas,
    'add-tarjeta': () => addTarjeta(''),
    'tarjeta-desde-m5': () => addTarjeta(val('respuestas.M5'), val('respuestas.M6')),
    'del-tarjeta': () => { if (confirm('¿Eliminar este problema?')) { caso.tarjetas.splice(+b.dataset.i, 1); cambio(); } },
    'add-calculo': () => { const t = caso.tarjetas[+b.dataset.i]; (t.calculos || (t.calculos = [])).push({ formula: '', campos: {} }); cambio(); },
    'del-calculo': () => { caso.tarjetas[+b.dataset.i].calculos.splice(+b.dataset.k, 1); cambio(); },
    'add-inventario': () => { (caso.inventario || (caso.inventario = [])).push({ fuente: '', contenido: '', quien: '', existe: '', completa: '', fiable: '', pistas: '' }); cambio(); },
    'del-inventario': () => { caso.inventario.splice(+b.dataset.i, 1); cambio(); },
    'mover': () => mover(b.dataset.id, +b.dataset.dir),
    'reset-orden': () => { caso.orden = { manual: [], motivos: {} }; cambio(); },
    'descargar-kit': () => descargarKit(+b.dataset.i),
    'imprimir': () => window.print(),
    'cerrar-dialogo': () => document.getElementById('dialogo').close()
  };
  if (acciones[a]) { e.preventDefault(); await acciones[a](); }
}

function cambio() { programarGuardado(); repintar(); }

// ---------- Acciones ----------

async function nuevoCaso() {
  const nombre = prompt('Nombre de la empresa:');
  if (nombre === null) return;
  const c = L.casoVacio(nuevoId('caso-'), nombre.trim() || 'Empresa sin nombre');
  await S.guardar(c); caso = c; ir('motivo');
}

async function abrirEjemplo() {
  const existe = await S.obtener('ejemplo-hidrotex');
  if (existe && !confirm('Ya tienes el ejemplo. ¿Quieres restaurarlo a su versión original? (Se perderán los cambios que le hayas hecho.)')) { caso = existe; ir('motivo'); return; }
  const c = await fetch('casos/hidrotex.json').then((r) => r.json());
  c.actualizado = new Date().toISOString();
  await S.guardar(c); caso = c; ir('motivo');
}

function descargar(nombre, contenido, tipo) {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

async function exportarCaso(id) {
  const c = id === caso?.id ? caso : await S.obtener(id);
  if (!c) return;
  descargar(`caso-${c.id}.json`, JSON.stringify(c, null, 2), 'application/json');
}

async function borrarCaso(id) {
  const c = await S.obtener(id);
  if (!c || !confirm(`¿Borrar el caso «${c.empresa?.nombre}»? No se puede deshacer. Si quieres conservarlo, expórtalo antes.`)) return;
  await S.borrar(id); pintarInicio();
}

async function accionArchivo(el) {
  const f = el.files && el.files[0];
  if (!f) return;
  const txt = await f.text();
  el.value = '';
  if (el.dataset.actionFile === 'importar-caso') {
    try {
      const c = JSON.parse(txt);
      if (c.tipo !== 'caso-diagnostico') throw new Error('Este archivo no es un caso de la herramienta.');
      if ((await S.obtener(c.id)) && !confirm('Ya existe un caso con ese identificador. ¿Sustituirlo?')) return;
      await S.guardar(c); caso = c; ir('motivo');
    } catch (err) { alert('No se pudo importar: ' + err.message); }
  } else if (el.dataset.actionFile === 'respuestas') {
    aplicarRespuestas(txt);
  }
}

function descargarFormulario() {
  if (!(caso.motivos || []).length && !confirm('Todavía no has elegido motivo de consulta: el cuestionario solo tendrá las preguntas generales. ¿Seguir?')) return;
  const html = generarFormulario(caso, { base: C.base, motivos: C.motivos, areas: C.areas, enJuego: enJuego() });
  descargar(`cuestionario-${nombreKit(caso, { titulo: '' }).replace(/^kit-|-$/g, '')}.html`, html, 'text/html');
  dialogo('Cuestionario descargado', `<p>Mándale este archivo al empresario por correo o WhatsApp. Lo abre en su móvil o su ordenador, contesta, y pulsa «Copiar mis respuestas» o «Descargar archivo».</p><p>Cuando te lo devuelva, usa «Importar sus respuestas».</p>`);
}

function importarRespuestas() {
  dialogo('Importar las respuestas del empresario', `
    <p>Pega aquí el texto que te ha enviado o elige el archivo.</p>
    <textarea id="txt-respuestas" rows="6" placeholder='{"tipo":"respuestas-empresario", …}'></textarea>
    <div class="botonera"><button class="btn primario" id="btn-aplicar">Importar</button>
    <label class="btn">Elegir archivo<input type="file" accept=".json,application/json,text/plain" data-action-file="respuestas" hidden></label></div>`);
  document.getElementById('btn-aplicar').onclick = () => aplicarRespuestas(document.getElementById('txt-respuestas').value);
}

function aplicarRespuestas(texto) {
  try {
    if (L.pareceDatosPersonales(texto)) {
      alert('Parece que el texto incluye datos personales de terceros (teléfonos, correos o documentos de identidad). Pide al empresario que los quite y vuelva a enviarlo: aquí solo trabajamos con procesos y herramientas.');
      return;
    }
    const d = leerRespuestas(texto);
    caso.respuestas = { ...(caso.respuestas || {}), ...d.respuestas };
    Object.entries(d.autoniveles || {}).forEach(([id, n]) => setPath(caso, `areas.${id}.autonivel`, n));
    caso.origenRespuestas = 'empresario';
    if (d.respuestas.M1 && (!caso.empresa.nombre || caso.empresa.nombre === 'Empresa sin nombre')) caso.empresa.nombre = d.respuestas.M1.split(/[:.,]/)[0].slice(0, 60);
    document.getElementById('dialogo').close();
    cambio();
    aviso('Respuestas importadas');
  } catch (err) { alert(err.message); }
}

function addTarjeta(titulo, dolor) {
  const ts = caso.tarjetas || (caso.tarjetas = []);
  let n = ts.length + 1;
  while (ts.some((t) => t.id === `T${n}`)) n++;
  ts.push({ id: `T${n}`, titulo: titulo || '', area: '', dolor: dolor ? String(L.leerCantidad(dolor).v || '') : '', calculos: [], datos: '', solucion: '', patron: '', destino: '', urgencia: '', baseDe: [], viabilidad: 'viable', quickWin: false, abordar: true, primerPaso: '' });
  cambio();
}

function mover(id, dir) {
  const ids = L.ordenFinal(caso, C.patrones).items.map((i) => i.id);
  const k = ids.indexOf(id), j = k + dir;
  if (j < 0 || j >= ids.length) return;
  const motivo = prompt('¿Por qué cambias el orden propuesto? (se mostrará en el informe)', caso.orden?.motivos?.[id] || '');
  if (!motivo || !motivo.trim()) { alert('Para mover un problema hace falta escribir el motivo.'); return; }
  [ids[k], ids[j]] = [ids[j], ids[k]];
  caso.orden = caso.orden || { manual: [], motivos: {} };
  caso.orden.manual = ids;
  caso.orden.motivos = { ...(caso.orden.motivos || {}), [id]: motivo.trim() };
  cambio();
}

async function descargarKit(i) {
  const t = caso.tarjetas[i];
  const files = generarKit(caso, t, { areas: C.areas, motivos: C.motivos, patrones: C.patrones, base: C.base }, C.plantillas, C.skills);
  const raiz = nombreKit(caso, t);
  const conRaiz = Object.fromEntries(Object.entries(files).map(([ruta, txt]) => [`${raiz}/${ruta}`, txt]));
  descargar(`${raiz}.zip`, new Blob([crearZip(conRaiz)], { type: 'application/zip' }));
  const pend = Object.values(files).join('\n').match(/\[PENDIENTE[^\]]*\]/g) || [];
  dialogo('Kit descargado', `<p>${Object.keys(files).length} archivos en <strong>${esc(raiz)}.zip</strong>.</p><p>${pend.length ? `Quedan <strong>${pend.length}</strong> huecos marcados como [PENDIENTE]: complétalos con el cliente antes de empezar.` : 'Sin huecos pendientes.'}</p><p>Descomprime, abre la carpeta con OpenCode y empieza con <code>/plan</code>.</p>`);
}

function dialogo(titulo, html) {
  const d = document.getElementById('dialogo');
  d.innerHTML = `<div class="dlg"><div class="dlg-cab"><h2>${esc(titulo)}</h2><button class="btn peq" data-action="cerrar-dialogo" aria-label="Cerrar">✕</button></div>${html}</div>`;
  if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
}

iniciar();
