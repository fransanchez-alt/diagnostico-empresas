// Excel de cálculos (.xlsx) con fórmulas vivas, sin dependencias: el empresario cambia un dato y ve el resultado.
import { crearZip } from './zip.js';
import { calcular, leerCantidad, opciones } from './logic.js';

const x = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const xt = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const col = (n) => { let s = ''; n += 1; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

// celda: número | texto | { f: 'FÓRMULA' } | { t: 'texto', b: true } | null
function celda(v, ref) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') return `<c r="${ref}"><v>${v}</v></c>`;
  if (typeof v === 'object' && v.f) return `<c r="${ref}"${v.b ? ' s="1"' : ''}><f>${xt(v.f)}</f></c>`;
  const txt = typeof v === 'object' ? v.t : v;
  const bold = typeof v === 'object' && v.b;
  return `<c r="${ref}" t="inlineStr"${bold ? ' s="1"' : ''}><is><t xml:space="preserve">${xt(txt)}</t></is></c>`;
}

function hojaXml(filas, anchos = []) {
  const cols = anchos.length ? `<cols>${anchos.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>` : '';
  const rows = filas.map((fila, r) => `<row r="${r + 1}">${fila.map((v, c) => celda(v, `${col(c)}${r + 1}`)).join('')}</row>`).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${cols}<sheetData>${rows}</sheetData></worksheet>`;
}

// hojas: [{ nombre, filas, anchos }] → Uint8Array con el .xlsx
export function crearXlsx(hojas) {
  const archivos = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${hojas.map((h, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${hojas.map((h, i) => `<sheet name="${x(h.nombre)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${hojas.map((h, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${hojas.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>`
  };
  hojas.forEach((h, i) => { archivos[`xl/worksheets/sheet${i + 1}.xml`] = hojaXml(h.filas, h.anchos); });
  return crearZip(archivos);
}

const TIPO = { duro: 'dinero', tiempo: 'tiempo del equipo', riesgo: 'riesgo' };
const n = (v) => { const r = leerCantidad(v).v; return r === null ? null : r; };

// Construye las tres hojas del simulador a partir del caso.
export function hojasSimulador(caso) {
  const op = opciones(caso);
  const B = (t) => ({ t, b: true });
  const calc = [[B('Tarjeta'), B('Problema'), B('Fórmula'), B('Tipo'), B('Dato 1'), B('Valor 1'), B('Dato 2'), B('Valor 2'), B('Dato 3'), B('Valor 3'), B('Horas/año'), B('€/año'), B('Operación en la herramienta')]];
  (caso.tarjetas || []).forEach((t) => (t.calculos || []).forEach((c) => {
    if (!c.formula) return;
    const r = calcular(c, op);
    const f = (k) => n(c.campos && c.campos[k] && c.campos[k].v);
    const fila = calc.length + 1;
    const R = (s) => s.replace(/#/g, fila);
    let datos, horas = null, euros;
    switch (c.formula) {
      case 'F1':
        datos = ['Horas a la semana', r.horasSemana, 'Semanas al año', op.semanas, '€ por hora', r.eurosHora];
        horas = { f: R('IF(F#="","",ROUNDDOWN(F#*H#,0))') };
        euros = { f: R('IF(OR(F#="",J#=""),"",ROUNDDOWN(F#*H#*J#,0))') };
        break;
      case 'F2': datos = ['Ventas perdidas al año (€)', f('importe'), 'Margen bruto (%)', f('margen'), '', null]; euros = { f: R('IF(F#="","",IF(H#="",F#,ROUNDDOWN(F#*H#/100,0)))') }; break;
      case 'F3': datos = ['Valor del stock parado (€)', f('valorStock'), 'Coste anual de tenerlo (%)', f('costePct'), '', null]; euros = { f: R('IF(OR(F#="",H#=""),"",ROUNDDOWN(F#*H#/100,0))') }; break;
      case 'F4': datos = ['Gasto anual (€)', f('gasto'), 'Reducción esperada (%)', f('reduccion'), '', null]; euros = { f: R('IF(OR(F#="",H#=""),"",ROUNDDOWN(F#*H#/100,0))') }; break;
      case 'F5': datos = ['Importe de la compra (€)', f('importeCompra'), 'Descuento perdido (%)', f('descuento'), '', null]; euros = { f: R('IF(OR(F#="",H#=""),"",ROUNDDOWN(F#*H#/100,0))') }; break;
      case 'F6': datos = ['Probabilidad al año (%)', f('probabilidad'), 'Impacto si ocurre (€)', f('impacto'), '', null]; euros = { f: R('IF(OR(F#="",H#=""),"",ROUNDDOWN(F#/100*H#,0))') }; break;
      default: return;
    }
    calc.push([t.id, t.titulo || '', c.formula, TIPO[r.tipo], ...datos, horas, euros, r.operacion]);
  }));
  const ult = calc.length;
  calc.push([]);
  calc.push([B('Ahorro en dinero (€/año)'), null, null, null, null, null, null, null, null, null, null, { f: `SUMIF(D2:D${ult},"dinero",L2:L${ult})`, b: true }]);
  calc.push([B('Tiempo del equipo (h/año)'), null, null, null, null, null, null, null, null, null, { f: `SUMIF(D2:D${ult},"tiempo del equipo",K2:K${ult})`, b: true }]);
  calc.push([B('Tiempo del equipo en € (coste de oportunidad, no se suma al dinero)'), null, null, null, null, null, null, null, null, null, null, { f: `SUMIF(D2:D${ult},"tiempo del equipo",L2:L${ult})`, b: true }]);

  const ret = [[B('Tarjeta'), B('Problema'), B('Coste hoy (€/año)'), B('% que resuelve la solución [S]'), B('Ahorro (€/año)'), B('Inversión inicial (€)'), B('Coste al mes (€)'), B('Meses para recuperarla')]];
  const sumaCoste = `'Cálculos'!L2:L${ult},'Cálculos'!A2:A${ult},A#,'Cálculos'!D2:D${ult},"<>riesgo"`;
  (caso.tarjetas || []).filter((t) => t.abordar !== false).forEach((t) => {
    const fila = ret.length + 1;
    const R = (s) => s.replace(/#/g, fila);
    ret.push([t.id, t.titulo || '', { f: R(`IF(SUMIFS(${sumaCoste})=0,"",SUMIFS(${sumaCoste}))`) },
      n(t.resuelve), { f: R('IF(OR(C#="",D#=""),"",ROUNDDOWN(C#*D#/100,0))') }, n(t.inversion), n(t.costeMes),
      { f: R('IF(OR(E#="",F#=""),"",IF(E#/12-G#>0,ROUNDUP(F#/(E#/12-G#),0),"no se recupera"))') }]);
  });

  const leeme = [[B(`Simulador de costes · ${(caso.empresa && caso.empresa.nombre) || ''}`)], [],
    ['Cambia los valores de las columnas «Valor» (hoja Cálculos) o el % que resuelve, la inversión y el coste al mes (hoja Retorno): los resultados se recalculan solos.'],
    ['Reglas: se redondea hacia abajo; de un rango se usa el valor bajo; las semanas al año son las trabajadas, no las 52.'],
    ['«Tiempo del equipo» son horas que se devuelven a la plantilla: es coste de oportunidad, no dinero que deja de pagarse. Por eso no se suma al ahorro en dinero.'],
    ['[E] lo declara la empresa · [C] lo ha comprobado el consultor · [S] es una hipótesis prudente. Los ahorros son estimaciones y se comprueban con pruebas antes de construir nada.']];

  return [
    { nombre: 'Léeme', filas: leeme, anchos: [120] },
    { nombre: 'Cálculos', filas: calc, anchos: [9, 34, 8, 16, 26, 11, 24, 11, 14, 11, 11, 12, 70] },
    { nombre: 'Retorno', filas: ret, anchos: [9, 34, 16, 18, 14, 16, 14, 18] }
  ];
}
