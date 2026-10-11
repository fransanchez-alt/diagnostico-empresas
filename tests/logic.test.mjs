// Tests de la lógica del método: criterios de aceptación (R11) y tabla de ejemplos (R12).
// Ejecutar con: node --test tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  leerCantidad, fmt, calcular, costeTarjeta, cuadrante, umbralMatriz, ordenPropuesto, ordenFinal,
  areasEnJuego, clasificarAreas, pareceDatosPersonales, dafo
} from '../js/logic.js';

const leer = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const areas = leer('../content/areas.json');
const motivos = leer('../content/motivos.json');
const patrones = leer('../content/patrones.json');
const hidrotex = leer('../casos/hidrotex.json');

const tarjeta = (id, dolor, calculos, extra = {}) => ({ id, titulo: id, dolor, calculos, abordar: true, viabilidad: 'viable', ...extra });
const gasto = (v, o = 'E') => ({ formula: 'F4', campos: { gasto: { v: String(v), o: 'E' }, reduccion: { v: '100', o } } });

test('formato español con miles siempre agrupados', () => {
  assert.equal(fmt(5000), '5.000');
  assert.equal(fmt(645), '645');
  assert.equal(fmt(2.5, 2), '2,5');
});

test('CA-01 · 3 h/semana sin €/hora → 154 h/año y sin euros', () => {
  const r = calcular({ formula: 'F1', campos: { horasSemana: { v: '3', o: 'E' } } });
  assert.equal(r.horasAnio, 154);
  assert.equal(r.valor, null);
  assert.match(r.operacion, /154 h\/año/);
});

test('CA-02 · un rango «3 o 4» usa el valor bajo y lo indica', () => {
  assert.deepEqual(leerCantidad('3 o 4'), { v: 3, rango: true });
  assert.deepEqual(leerCantidad('30.000-40.000'), { v: 30000, rango: true });
  const r = calcular({ formula: 'F2', campos: { importe: { v: '3 o 4', o: 'E' } } });
  assert.ok(r.notas.some((n) => n.includes('valor bajo')));
});

test('CA-03 / R12-4 · dolor 5 y 200-300 €/año con umbral 5.000 → «se explica con cifras»', () => {
  const papel = tarjeta('papel', 5, [gasto(300)]);
  const otra = tarjeta('clima', 1, [gasto(40000)]);
  const q = cuadrante(papel, 5000, [papel, otra]);
  assert.equal(q.clave, 'cifras');
  assert.equal(q.frase, 'Te molesta mucho, pero cuesta unos 300 € al año; hay otros problemas que te cuestan bastante más.');
});

test('CA-04 · dolor 2 y 12.000 €/año → «lo que no ves y te está costando»', () => {
  assert.equal(cuadrante(tarjeta('x', 2, [gasto(12000)]), 5000).clave, 'noves');
});

test('R12-5 · climatización: hipótesis del 15 % → 6.000 €/año, marcada como supuesto', () => {
  const clima = tarjeta('clima', 1, [{ formula: 'F4', campos: { gasto: { v: '40000', o: 'E' }, reduccion: { v: '15', o: 'S' } } }]);
  const c = costeTarjeta(clima);
  assert.equal(c.valor, 6000);
  assert.equal(c.hipotesis, true);
  assert.equal(cuadrante(clima, 5000).clave, 'noves');
});

test('CA-05 · una urgencia sin cifra va antes que cualquier tarjeta con euros', () => {
  const caso = { tarjetas: [tarjeta('cara', 5, [gasto(90000)]), tarjeta('copias', 1, [], { urgencia: 'Sin copias de los datos de los que vive el negocio' })] };
  const o = ordenPropuesto(caso, patrones);
  assert.equal(o.items[0].id, 'copias');
  assert.equal(o.items[0].escalon, 1);
});

test('CA-06 · la revisión de datos va antes que la previsión, como base', () => {
  const caso = { tarjetas: [tarjeta('prevision', 5, [gasto(30000)], { patron: 'P2' }), tarjeta('revision', 2, [], { patron: 'P1' })] };
  const o = ordenPropuesto(caso, patrones);
  assert.deepEqual(o.items.map((i) => i.id), ['revision', 'prevision']);
  assert.match(o.items[0].porque, /^Base/);
});

test('CA-07 · un área no explorada no aparece como nivel 0', () => {
  const en = areasEnJuego(hidrotex, motivos, areas);
  const cl = clasificarAreas(hidrotex, en, areas);
  const a4 = cl.filas.find((f) => f.id === 'A4');
  assert.equal(a4.estado, 'no explorada');
  assert.equal(a4.nivel, undefined);
});

test('CA-08 · un ajuste manual solo se marca si tiene motivo', () => {
  const o = ordenFinal(hidrotex, patrones);
  const t4 = o.items.find((i) => i.id === 'T4');
  assert.equal(t4.ajustada, true);
  assert.ok(t4.motivoAjuste.length > 10);
});

test('CA-11 · un listado de clientes con teléfonos se detecta', () => {
  assert.equal(pareceDatosPersonales('Juan 612345678\nAna 698765432\nLuis 677889900'), true);
  assert.equal(pareceDatosPersonales('Unas 30 llamadas a la semana'), false);
});

test('R12-2 · 30 consultas × 5 min, 5 días → 53 h/mes y 645 h/año', () => {
  const r = calcular({ formula: 'F1', campos: { vecesDia: { v: '30', o: 'E' }, minutos: { v: '5', o: 'E' }, diasSemana: { v: '5', o: 'E' } } });
  assert.equal(r.horasMes, 53);
  assert.equal(r.horasAnio, 645);
});

test('R12-3 · ventas perdidas sin margen: importe como dato y margen pendiente', () => {
  const r = calcular({ formula: 'F2', campos: { importe: { v: '30.000-40.000', o: 'E' } } });
  assert.equal(r.valor, 30000);
  assert.match(r.operacion, /30\.000 € de ventas perdidas \[E\].*\[PENDIENTE: margen\]/);
});

test('R12-1 · Hidrotex reproduce el Anexo A', () => {
  const en = areasEnJuego(hidrotex, motivos, areas);
  const cl = clasificarAreas(hidrotex, en, areas);
  assert.deepEqual([...cl.debilidades].sort(), ['A2', 'A3', 'A5', 'A6']);
  assert.deepEqual(cl.fortalezas, []);
  const auto = ordenPropuesto(hidrotex, patrones).items.map((i) => i.id);
  assert.deepEqual(auto, ['T5', 'T1', 'T2', 'T3', 'T6', 'T4']);
  const final = ordenFinal(hidrotex, patrones).items.map((i) => i.id);
  assert.deepEqual(final, ['T5', 'T1', 'T2', 'T3', 'T4', 'T6']);
  const t4 = costeTarjeta(hidrotex.tarjetas.find((t) => t.id === 'T4'));
  assert.equal(t4.horasAnio, 645);
  assert.equal(umbralMatriz(hidrotex).valor, 5000);
  const t2 = hidrotex.tarjetas.find((t) => t.id === 'T2');
  assert.equal(cuadrante(t2, 5000, hidrotex.tarjetas).clave, 'primero');
  const d = dafo(hidrotex, en, areas, patrones);
  assert.ok(d.A.some((x) => x.includes('Datos personales')));
});

test('R12-6 · dependencia de una persona que se va en 8 meses se trata como urgencia', () => {
  const caso = { tarjetas: [tarjeta('otra', 5, [gasto(20000)]), tarjeta('antonio', 3, [], { urgencia: 'Dependencia total de una persona que se va en menos de 12 meses' })] };
  assert.equal(ordenPropuesto(caso, patrones).items[0].id, 'antonio');
});

test('R12-7 · un caso vacío no inventa nada', () => {
  const caso = { tarjetas: [], areas: {}, motivos: [] };
  assert.equal(ordenPropuesto(caso, patrones).items.length, 0);
  assert.equal(umbralMatriz(caso).valor, null);
});

test('CA-09 · el kit de P1 contiene todos los archivos y marca los pendientes', async () => {
  const { generarKit, PLANTILLAS } = await import('../js/kit.js');
  const base = leer('../content/base.json');
  const plantillas = Object.fromEntries(PLANTILLAS.map((p) => [p, readFileSync(new URL(`../content/kit/${p}`, import.meta.url), 'utf8')]));
  const skills = Object.fromEntries(patrones.map((p) => [p.slug, readFileSync(new URL(`../content/skills/${p.slug}.md`, import.meta.url), 'utf8')]));
  const t1 = hidrotex.tarjetas.find((t) => t.id === 'T1');
  const kit = generarKit(hidrotex, t1, { areas, motivos, patrones, base }, plantillas, skills);
  for (const ruta of ['AGENTS.md', 'docs/cliente.md', 'docs/diagnostico.md', 'docs/requisitos.md', 'specs/aceptacion.md', 'specs/ejemplos.md',
    'progress/actual.md', 'progress/lecciones.md', '.opencode/commands/plan.md', '.opencode/commands/verificar.md', '.opencode/commands/cerrar.md',
    '.agents/skills/revision-datos/SKILL.md', 'tests/README.md', 'init.sh', 'datos/LEEME.md']) assert.ok(kit[ruta], `falta ${ruta}`);
  assert.ok(!Object.values(kit).join('').includes('{{'), 'quedan variables sin rellenar');
  assert.match(kit['AGENTS.md'], /Hidrotex/);
  assert.match(kit['progress/actual.md'], /Leer el fichero de ventas/);
  const t2 = hidrotex.tarjetas.find((t) => t.id === 'T2');
  const kit2 = generarKit(hidrotex, t2, { areas, motivos, patrones, base }, plantillas, skills);
  assert.match(kit2['docs/requisitos.md'], /\[PENDIENTE/);
  const ligero = generarKit(hidrotex, { ...t1, destino: 'asiste' }, { areas, motivos, patrones, base }, plantillas, skills);
  assert.equal(ligero['docs/requisitos.md'], undefined);
  assert.ok(ligero['AGENTS.md']);
});

test('el .zip generado es válido y conserva acentos', async () => {
  const { crearZip } = await import('../js/zip.js');
  const { writeFileSync } = await import('node:fs');
  const { execSync } = await import('node:child_process');
  const bytes = crearZip({ 'kit/AGENTS.md': '# Diagnóstico ñ', 'kit/init.sh': 'echo hola\n' });
  writeFileSync('/tmp/prueba-kit.zip', bytes);
  const salida = execSync('unzip -t /tmp/prueba-kit.zip').toString();
  assert.match(salida, /No errors detected/);
  assert.equal(execSync('unzip -p /tmp/prueba-kit.zip kit/AGENTS.md').toString(), '# Diagnóstico ñ');
});
