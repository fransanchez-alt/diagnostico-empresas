// Lógica pura del método (sin DOM). La usan la web y los tests (node --test).

export const SEMANA_MES = 4.3;
export const MESES = 12;

// ---------- Números ----------

// Lee un número escrito a la española. Acepta rangos ("3 o 4", "30.000-40.000"):
// devuelve el valor bajo y marca rango=true.
export function leerCantidad(entrada) {
  if (entrada === null || entrada === undefined) return { v: null, rango: false };
  if (typeof entrada === 'number') return { v: Number.isFinite(entrada) ? entrada : null, rango: false };
  const txt = String(entrada).trim();
  if (!txt) return { v: null, rango: false };
  const partes = txt.split(/\s*(?:-|–|—|\bo\b|\ba\b)\s*/i).filter(Boolean);
  const nums = partes.map(numeroEs).filter((n) => n !== null);
  if (!nums.length) return { v: null, rango: false };
  return { v: Math.min(...nums), rango: nums.length > 1 };
}

function numeroEs(s) {
  let t = String(s).replace(/[€%\s]/g, '').replace(/[a-záéíóúñ/]+$/i, '');
  if (!t) return null;
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// Formato español con separador de miles siempre (5.000) y coma decimal.
export function fmt(n, dec = 0) {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  const neg = n < 0;
  const fijo = Math.abs(n).toFixed(dec);
  let [ent, frac] = fijo.split('.');
  ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (neg ? '-' : '') + ent + (frac && Number(frac) !== 0 ? ',' + frac.replace(/0+$/, '') : '');
}

const abajo = (n) => Math.floor(n + 1e-9);

// ---------- Fórmulas F1-F6 ----------

// calculo = { formula: 'F1', campos: { nombre: { v: '3 o 4', o: 'E' } } }
// Devuelve { valor (€/año para ordenar o null), horasAnio, horasMes, operacion, hipotesis,
//            faltan[], notas[], riesgo (solo F6), etiqueta }
export function calcular(calculo) {
  const c = (calculo && calculo.campos) || {};
  const usados = [];
  const notas = [];
  const get = (k) => {
    const campo = c[k];
    if (!campo) return null;
    const { v, rango } = leerCantidad(campo.v);
    if (v === null) return null;
    usados.push(campo.o || 'E');
    if (rango) notas.push(`Rango declarado en «${campo.v}»: se usa el valor bajo (${fmt(v, 2)}).`);
    return { v, o: campo.o || 'E' };
  };
  const tag = (x) => `[${x.o}]`;
  const r = { valor: null, horasAnio: null, horasMes: null, operacion: '', hipotesis: false, faltan: [], notas, riesgo: null, etiqueta: '' };

  switch (calculo && calculo.formula) {
    case 'F1': {
      const veces = get('vecesDia'), min = get('minutos'), hd = get('horasDia'), dias = get('diasSemana'), hs = get('horasSemana'), eh = get('eurosHora');
      let horasSemana = null, op = '';
      if (hs) { horasSemana = hs.v; op = `${fmt(hs.v, 2)} h/semana ${tag(hs)}`; }
      else {
        let horasDia = null, opDia = '';
        if (veces && min) { horasDia = veces.v * min.v / 60; opDia = `${fmt(veces.v, 2)} veces/día ${tag(veces)} × ${fmt(min.v, 2)} min ${tag(min)} = ${fmt(horasDia, 2)} h/día`; }
        else if (hd) { horasDia = hd.v; opDia = `${fmt(hd.v, 2)} h/día ${tag(hd)}`; }
        if (horasDia !== null && dias) { horasSemana = horasDia * dias.v; op = `${opDia} × ${fmt(dias.v, 2)} días ${tag(dias)}`; }
      }
      if (horasSemana === null) { r.faltan.push('horas a la semana (o horas al día y días a la semana)'); break; }
      const mes = horasSemana * SEMANA_MES, anio = mes * MESES;
      r.horasMes = abajo(mes); r.horasAnio = abajo(anio);
      op += ` × 4,3 = ${fmt(r.horasMes)} h/mes · × 12 = ${fmt(r.horasAnio)} h/año`;
      if (eh) { r.valor = abajo(anio * eh.v); op += ` × ${fmt(eh.v, 2)} €/h ${tag(eh)} = ${fmt(r.valor)} €/año`; }
      else notas.push('Sin coste por hora declarado: el resultado se da solo en horas.');
      r.operacion = op; r.etiqueta = r.valor !== null ? `${fmt(r.valor)} €/año` : `${fmt(r.horasAnio)} h/año`;
      break;
    }
    case 'F2': {
      const imp = get('importe'), mg = get('margen');
      if (!imp) { r.faltan.push('ventas perdidas al año'); break; }
      if (mg) {
        r.valor = abajo(imp.v * mg.v / 100);
        r.operacion = `${fmt(imp.v)} € ${tag(imp)} × ${fmt(mg.v, 2)} % de margen ${tag(mg)} = ${fmt(r.valor)} €/año`;
        r.etiqueta = `${fmt(r.valor)} €/año`;
      } else {
        r.valor = abajo(imp.v);
        r.operacion = `${fmt(imp.v)} € de ventas perdidas ${tag(imp)}; el coste real es el margen sobre esa cifra [PENDIENTE: margen]`;
        r.etiqueta = `${fmt(r.valor)} € de ventas (cota alta)`;
        notas.push('Sin margen declarado: se usa el importe de ventas, que es más alto que el coste real.');
      }
      break;
    }
    case 'F3': {
      const vs = get('valorStock'), pct = get('costePct');
      if (!vs) { r.faltan.push('valor del stock parado'); break; }
      if (pct) {
        r.valor = abajo(vs.v * pct.v / 100);
        r.operacion = `${fmt(vs.v)} € inmovilizados ${tag(vs)} × ${fmt(pct.v, 2)} % ${tag(pct)} = ${fmt(r.valor)} €/año`;
        r.etiqueta = `${fmt(r.valor)} €/año`;
      } else {
        r.operacion = `${fmt(vs.v)} € inmovilizados ${tag(vs)}; falta el coste anual de tenerlos [PENDIENTE]`;
        r.etiqueta = `${fmt(vs.v)} € inmovilizados`;
        notas.push('Sin coste anual: se muestra el valor inmovilizado, que no es un coste al año.');
      }
      break;
    }
    case 'F4': {
      const g = get('gasto'), red = get('reduccion');
      if (!g || !red) { if (!g) r.faltan.push('gasto anual'); if (!red) r.faltan.push('reducción esperada'); break; }
      r.valor = abajo(g.v * red.v / 100);
      r.operacion = `${fmt(g.v)} €/año ${tag(g)} × ${fmt(red.v, 2)} % ${tag(red)} = ${fmt(r.valor)} €/año de ahorro posible`;
      r.etiqueta = `${fmt(r.valor)} €/año`;
      break;
    }
    case 'F5': {
      const ic = get('importeCompra'), d = get('descuento');
      if (!ic || !d) { if (!ic) r.faltan.push('importe de la compra'); if (!d) r.faltan.push('descuento'); break; }
      r.valor = abajo(ic.v * d.v / 100);
      r.operacion = `${fmt(ic.v)} € ${tag(ic)} × ${fmt(d.v, 2)} % ${tag(d)} = ${fmt(r.valor)} €/año`;
      r.etiqueta = `${fmt(r.valor)} €/año`;
      break;
    }
    case 'F6': {
      const p = get('probabilidad'), im = get('impacto');
      if (!p || !im) { if (!p) r.faltan.push('probabilidad'); if (!im) r.faltan.push('impacto'); break; }
      r.riesgo = abajo(p.v / 100 * im.v);
      r.operacion = `${fmt(p.v, 2)} % ${tag(p)} × ${fmt(im.v)} € ${tag(im)} = ${fmt(r.riesgo)} €/año de riesgo esperado (hipótesis)`;
      r.etiqueta = `Riesgo: ${fmt(r.riesgo)} €/año (hipótesis)`;
      r.hipotesis = true;
      break;
    }
    default:
      r.faltan.push('elegir una fórmula');
  }
  if (usados.includes('S')) r.hipotesis = true;
  if (r.faltan.length && !r.operacion) r.operacion = 'Sin datos: falta ' + r.faltan.join(', ') + '.';
  return r;
}

// Coste de una tarjeta = suma de los cálculos con valor. hipotesis si alguno lo es.
export function costeTarjeta(t) {
  const partes = (t.calculos || []).map(calcular);
  const conValor = partes.filter((p) => p.valor !== null);
  const valor = conValor.length ? conValor.reduce((s, p) => s + p.valor, 0) : null;
  const horasAnio = partes.reduce((s, p) => s + (p.horasAnio || 0), 0) || null;
  return { valor, horasAnio, hipotesis: conValor.some((p) => p.hipotesis), partes };
}

export function etiquetaCoste(t) {
  const c = costeTarjeta(t);
  if (c.valor !== null) return `${fmt(c.valor)} €/año${c.hipotesis ? ' (incluye supuestos)' : ''}`;
  if (c.horasAnio) return `${fmt(c.horasAnio)} h/año, sin euros`;
  return 'Sin datos';
}

// ---------- Áreas ----------

export function areasEnJuego(caso, motivos, todas) {
  const set = new Set(caso.areasManual || []);
  (caso.motivos || []).forEach((id) => {
    const m = motivos.find((x) => x.id === id);
    if (m) m.areas.forEach((a) => set.add(a));
  });
  if (caso.chequeoGeneral) todas.forEach((a) => set.add(a.id));
  return todas.filter((a) => set.has(a.id)).map((a) => a.id);
}

const IMPORTANCIA = { alta: 3, media: 2, baja: 1 };

export function clasificarAreas(caso, enJuego, todas) {
  const res = { fortalezas: [], debilidades: [], noExploradas: [], sinDatos: [], filas: [] };
  todas.forEach((a) => {
    const st = (caso.areas || {})[a.id] || {};
    if (!enJuego.includes(a.id)) { res.noExploradas.push(a.id); res.filas.push({ id: a.id, estado: 'no explorada' }); return; }
    if (st.noAplica) { res.filas.push({ id: a.id, estado: 'no aplica' }); return; }
    const nivel = num(st.nivel), obj = num(st.objetivo);
    if (nivel === null) { res.sinDatos.push(a.id); res.filas.push({ id: a.id, estado: 'sin datos', objetivo: obj }); return; }
    const brecha = obj === null ? null : obj - nivel;
    let tipo = 'neutra';
    if (brecha !== null && brecha <= 0) tipo = 'fortaleza';
    else if (brecha !== null && (brecha >= 2 || (brecha === 1 && st.importancia === 'alta'))) tipo = 'debilidad';
    if (tipo === 'fortaleza') res.fortalezas.push(a.id);
    if (tipo === 'debilidad') res.debilidades.push(a.id);
    res.filas.push({ id: a.id, estado: 'explorada', nivel, objetivo: obj, brecha, importancia: st.importancia || null, tipo });
  });
  res.debilidades.sort((x, y) => {
    const fx = res.filas.find((f) => f.id === x), fy = res.filas.find((f) => f.id === y);
    return (fy.brecha * (IMPORTANCIA[fy.importancia] || 1)) - (fx.brecha * (IMPORTANCIA[fx.importancia] || 1));
  });
  return res;
}

function num(v) { const n = leerCantidad(v).v; return n === null ? null : n; }

export function explicarArea(fila, nombre) {
  if (fila.estado === 'no explorada') return `${nombre}: no se ha explorado en esta visita.`;
  if (fila.estado === 'no aplica') return `${nombre}: no aplica a esta empresa.`;
  if (fila.estado === 'sin datos') return `${nombre}: sin datos para situar el nivel actual.`;
  if (fila.objetivo === null) return `${nombre}: está en el nivel ${fila.nivel}; falta acordar el objetivo.`;
  if (fila.tipo === 'fortaleza') return `${nombre} es una fortaleza: ya está en el nivel ${fila.nivel} y el objetivo es ${fila.objetivo}.`;
  if (fila.tipo === 'debilidad') return `${nombre} es una debilidad: está en el ${fila.nivel} y queréis llegar al ${fila.objetivo}${fila.importancia === 'alta' ? ', y es importante para vosotros' : ''}.`;
  return `${nombre}: le falta ${fila.brecha} nivel para el objetivo, con importancia ${fila.importancia || 'sin fijar'}.`;
}

// ---------- Matriz dolor × euros ----------

export function umbralMatriz(caso) {
  const manual = num(caso.umbralManual);
  if (manual !== null) return { valor: manual, origen: 'fijado por el consultor' };
  const fact = num(caso.empresa && caso.empresa.facturacion);
  if (fact !== null) return { valor: abajo(fact * 0.01), origen: '1 % de la facturación anual' };
  const vals = (caso.tarjetas || []).map((t) => costeTarjeta(t).valor).filter((v) => v !== null).sort((a, b) => a - b);
  if (vals.length) {
    const m = Math.floor(vals.length / 2);
    const med = vals.length % 2 ? vals[m] : (vals[m - 1] + vals[m]) / 2;
    return { valor: abajo(med), origen: 'mediana de los costes calculados' };
  }
  return { valor: null, origen: 'sin costes todavía' };
}

export const CUADRANTES = {
  primero: { titulo: 'Primero', texto: 'Duele y cuesta: se aborda en el orden por retorno.' },
  cifras: { titulo: 'Se explica con cifras', texto: 'Duele, pero cuesta poco: solo se aborda si es muy barato y rápido.' },
  noves: { titulo: 'Lo que no ves y te está costando', texto: 'Apenas molesta, pero cuesta mucho.' },
  aparcado: { titulo: 'Aparcado', texto: 'Ni duele ni cuesta: queda aparcado con su destino.' },
  sindatos: { titulo: 'Sin cifra', texto: 'Hace falta el dato para poder decidir.' }
};

export function cuadrante(t, umbral, todas = []) {
  const dolor = num(t.dolor) || 0;
  const c = costeTarjeta(t);
  const alto = dolor >= 4;
  let clave;
  if (c.valor === null || umbral === null || umbral === undefined) clave = c.valor === null ? 'sindatos' : (alto ? 'primero' : 'aparcado');
  else if (c.valor >= umbral) clave = alto ? 'primero' : 'noves';
  else clave = alto ? 'cifras' : 'aparcado';
  return { clave, alto, coste: c.valor, frase: fraseCuadrante(clave, c, todas, t) };
}

function fraseCuadrante(clave, c, todas, t) {
  const otros = todas.filter((x) => x !== t).map((x) => costeTarjeta(x).valor).filter((v) => v !== null);
  const maxOtro = otros.length ? Math.max(...otros) : null;
  switch (clave) {
    case 'cifras':
      return `Te molesta mucho, pero cuesta unos ${fmt(c.valor)} € al año` + (maxOtro !== null && maxOtro > c.valor ? '; hay otros problemas que te cuestan bastante más.' : '.');
    case 'noves':
      return `Casi no te molesta, pero te está costando unos ${fmt(c.valor)} € al año.`;
    case 'primero':
      return c.valor !== null ? `Te molesta y además cuesta unos ${fmt(c.valor)} € al año: va de los primeros.` : 'Te molesta mucho; falta el dato de cuánto cuesta.';
    case 'aparcado':
      return 'Ni molesta mucho ni cuesta mucho: lo dejamos aparcado de momento.';
    default:
      return c.horasAnio ? `Se van unas ${fmt(c.horasAnio)} horas al año; falta saber cuánto vale una hora para pasarlo a euros.` : 'Todavía no sabemos cuánto cuesta.';
  }
}

// ---------- Orden de prioridad ----------

const VIAB = { viable: 0, parcial: 1 };

export function ordenPropuesto(caso, patrones) {
  const ts = (caso.tarjetas || []).filter((t) => t.abordar !== false);
  const noViables = ts.filter((t) => t.viabilidad === 'no');
  const candidatas = ts.filter((t) => t.viabilidad !== 'no');
  const requiere = (t) => ((patrones.find((p) => p.id === t.patron) || {}).requiere) || [];
  const dependientes = (t) => candidatas.filter((o) => o !== t && (
    (t.patron && requiere(o).includes(t.patron)) || (t.baseDe || []).includes(o.id)));

  const items = candidatas.map((t) => {
    const c = costeTarjeta(t);
    const deps = dependientes(t);
    let escalon = 3, porque;
    if (t.urgencia) { escalon = 1; porque = `Urgencia: ${t.urgencia}.`; }
    else if (deps.length) { escalon = 2; porque = `Base: sin esto no se puede hacer ${deps.map((d) => `«${d.titulo}»`).join(' ni ')}.`; }
    else if (c.valor !== null) porque = `Retorno: cuesta ${fmt(c.valor)} €/año${t.viabilidad === 'parcial' ? '; viabilidad parcial' : ''}.`;
    else porque = `Retorno sin cifra en euros${c.horasAnio ? ` (${fmt(c.horasAnio)} h/año)` : ''}${t.viabilidad === 'parcial' ? '; viabilidad parcial' : ''}.`;
    return { id: t.id, titulo: t.titulo, escalon, porque, valor: c.valor, quick: !!t.quickWin, viab: VIAB[t.viabilidad] ?? 0 };
  });

  items.sort((a, b) => {
    if (a.escalon !== b.escalon) return a.escalon - b.escalon;
    if (a.escalon === 3 && a.viab !== b.viab) return a.viab - b.viab;
    if (a.escalon === 3) {
      if ((a.valor === null) !== (b.valor === null)) return a.valor === null ? 1 : -1;
      if (a.valor !== b.valor) return (b.valor || 0) - (a.valor || 0);
      return (b.quick ? 1 : 0) - (a.quick ? 1 : 0);
    }
    if (a.quick !== b.quick) return (b.quick ? 1 : 0) - (a.quick ? 1 : 0);
    return (b.valor || 0) - (a.valor || 0);
  });
  return { items, noViables: noViables.map((t) => ({ id: t.id, titulo: t.titulo })) };
}

// Aplica el orden manual del consultor (con motivos) sobre la propuesta.
export function ordenFinal(caso, patrones) {
  const prop = ordenPropuesto(caso, patrones);
  const manual = (caso.orden && caso.orden.manual) || [];
  const motivos = (caso.orden && caso.orden.motivos) || {};
  const ids = prop.items.map((i) => i.id);
  const final = manual.filter((id) => ids.includes(id)).concat(ids.filter((id) => !manual.includes(id)));
  const items = final.map((id, idx) => {
    const it = prop.items.find((i) => i.id === id);
    const posAuto = ids.indexOf(id);
    return { ...it, posicion: idx + 1, ajustada: posAuto !== idx && !!motivos[id], motivoAjuste: motivos[id] || '' };
  });
  return { items, noViables: prop.noViables };
}

// ---------- DAFO ----------

export function dafo(caso, enJuego, areas, patrones) {
  const cl = clasificarAreas(caso, enJuego, areas);
  const nombre = (id) => (areas.find((a) => a.id === id) || {}).nombre || id;
  const lineas = (txt) => String(txt || '').split('\n').map((s) => s.trim()).filter(Boolean);
  const oport = (caso.tarjetas || []).filter((t) => t.patron && costeTarjeta(t).valor !== null)
    .map((t) => `${(patrones.find((p) => p.id === t.patron) || {}).nombre}: «${t.titulo}»`);
  const urg = (caso.tarjetas || []).filter((t) => t.urgencia).map((t) => `${t.urgencia} («${t.titulo}»)`);
  return {
    F: cl.fortalezas.map(nombre).concat(lineas(caso.fortalezasNotas)),
    D: cl.debilidades.map(nombre),
    O: [...new Set(oport)].concat(lineas(caso.oportunidades)),
    A: urg.concat(lineas(caso.amenazas))
  };
}

// ---------- Privacidad ----------

// Detecta texto que parece contener datos personales de terceros (CA-11).
export function pareceDatosPersonales(texto) {
  const t = String(texto || '');
  const tel = (t.match(/(?:\+34\s?)?[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g) || []).length;
  const mail = (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).length;
  const dni = (t.match(/\b\d{8}[A-HJ-NP-TV-Z]\b/g) || []).length;
  const iban = /\bES\d{2}[\s]?\d{4}/.test(t);
  return tel + mail >= 3 || dni >= 1 || iban;
}

// ---------- Utilidades de caso ----------

export function casoVacio(id, nombre = 'Empresa sin nombre') {
  const ahora = new Date().toISOString();
  return {
    tipo: 'caso-diagnostico', version: '0.1', id, creado: ahora, actualizado: ahora,
    empresa: { nombre, sector: '', facturacion: '' },
    respuestas: {}, origenRespuestas: '', canvas: {}, motivos: [], areasManual: [], chequeoGeneral: false,
    porques: ['', '', '', '', ''], areas: {}, tarjetas: [], inventario: [],
    objetivoGeneral: '', umbralManual: '', cruces: {}, fortalezasNotas: '', oportunidades: '', amenazas: '', noTocar: '',
    orden: { manual: [], motivos: {} }
  };
}
