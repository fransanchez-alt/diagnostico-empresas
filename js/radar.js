// Gráfico de radar A (actual) · B (objetivo) · ideal (5). SVG sin librerías.
import { esc } from './formulario.js';

export function radarSVG(areas, filas, { inicial = null } = {}) {
  const W = 360, C = W / 2, R = 132, N = areas.length;
  const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / N;
  const pt = (i, v) => [C + Math.cos(ang(i)) * R * (v / 5), C + Math.sin(ang(i)) * R * (v / 5)];
  const fila = (id) => filas.find((f) => f.id === id) || {};
  let s = `<svg class="radar" viewBox="-84 -12 ${W + 168} ${W + 24}" role="img" aria-label="Gráfico de radar: nivel actual, objetivo e ideal por área">`;
  for (let k = 1; k <= 5; k++) {
    const pts = areas.map((_, i) => pt(i, k).join(',')).join(' ');
    s += `<polygon class="rejilla${k === 5 ? ' ideal' : ''}" points="${pts}"/>`;
  }
  areas.forEach((a, i) => {
    const [x, y] = pt(i, 5);
    s += `<line class="eje" x1="${C}" y1="${C}" x2="${x}" y2="${y}"/>`;
  });
  const serie = (clave, cls, valorDe) => {
    const vals = areas.map((a) => valorDe(fila(a.id)));
    // tramos entre áreas consecutivas con valor (las no exploradas cortan la línea)
    let d = '';
    for (let i = 0; i < N; i++) {
      const j = (i + 1) % N;
      if (vals[i] != null && vals[j] != null) {
        const [x1, y1] = pt(i, vals[i]), [x2, y2] = pt(j, vals[j]);
        d += `M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`;
      }
    }
    let out = d ? `<path class="serie ${cls}" d="${d}"/>` : '';
    vals.forEach((v, i) => { if (v != null) { const [x, y] = pt(i, v); out += `<circle class="punto ${cls}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4"><title>${esc(areas[i].nombre)}: ${clave} ${v}</title></circle>`; } });
    return out;
  };
  if (inicial) s += serie('inicial', 'inicial', (f) => (inicial[f.id] ?? null));
  s += serie('objetivo', 'objetivo', (f) => (f.estado === 'explorada' || f.estado === 'sin datos') && f.objetivo != null ? f.objetivo : null);
  s += serie('actual', 'actual', (f) => (f.estado === 'explorada' ? f.nivel : null));
  areas.forEach((a, i) => {
    const [x, y] = pt(i, 5.9);
    const f = fila(a.id);
    const anchor = Math.abs(x - C) < 8 ? 'middle' : x > C ? 'start' : 'end';
    const extra = f.estado === 'no explorada' ? ' (no explorada)' : f.estado === 'sin datos' ? ' (sin datos)' : f.estado === 'no aplica' ? ' (no aplica)' : '';
    s += `<text class="etq${extra ? ' apagada' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle">${esc(a.corto)}${extra ? `<tspan class="peq" x="${x.toFixed(1)}" dy="14">${extra.trim()}</tspan>` : ''}</text>`;
  });
  return s + '</svg>';
}

export function leyendaRadar() {
  const l = (cls, dash) => `<svg class="sw" viewBox="0 0 24 6" aria-hidden="true"><line class="${cls}" x1="1" y1="3" x2="23" y2="3"${dash ? ` stroke-dasharray="${dash}"` : ''}/></svg>`;
  return `<div class="leyenda"><span>${l('l-actual')}Hoy (A)</span><span>${l('l-objetivo', '6 3')}Objetivo (B)</span><span>${l('l-ideal', '2 3')}Ideal (5)</span></div>`;
}
