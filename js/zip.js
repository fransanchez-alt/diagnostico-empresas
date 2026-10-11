// Generador mínimo de .zip (sin compresión), sin dependencias. Suficiente para el kit del arnés.
const TABLA = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABLA[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// archivos: { 'carpeta/archivo.md': 'texto', ... } → Uint8Array con el .zip
export function crearZip(archivos, fecha = new Date()) {
  const enc = new TextEncoder();
  const dosHora = (fecha.getHours() << 11) | (fecha.getMinutes() << 5) | Math.floor(fecha.getSeconds() / 2);
  const dosFecha = ((fecha.getFullYear() - 1980) << 9) | ((fecha.getMonth() + 1) << 5) | fecha.getDate();
  const locales = [], centrales = [];
  let offset = 0;
  for (const [ruta, texto] of Object.entries(archivos)) {
    const nombre = enc.encode(ruta);
    const datos = enc.encode(texto);
    const crc = crc32(datos);
    const loc = new DataView(new ArrayBuffer(30));
    loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true);
    loc.setUint16(8, 0, true); loc.setUint16(10, dosHora, true); loc.setUint16(12, dosFecha, true);
    loc.setUint32(14, crc, true); loc.setUint32(18, datos.length, true); loc.setUint32(22, datos.length, true);
    loc.setUint16(26, nombre.length, true); loc.setUint16(28, 0, true);
    locales.push(new Uint8Array(loc.buffer), nombre, datos);
    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 0x0314, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true); cen.setUint16(12, dosHora, true); cen.setUint16(14, dosFecha, true);
    cen.setUint32(16, crc, true); cen.setUint32(20, datos.length, true); cen.setUint32(24, datos.length, true);
    cen.setUint16(28, nombre.length, true); cen.setUint16(30, 0, true); cen.setUint16(32, 0, true);
    cen.setUint16(34, 0, true); cen.setUint16(36, 0, true); cen.setUint32(38, ruta.endsWith('.sh') ? (0o100755 << 16) >>> 0 : 0, true);
    cen.setUint32(42, offset, true);
    centrales.push(new Uint8Array(cen.buffer), nombre);
    offset += 30 + nombre.length + datos.length;
  }
  const tamCentral = centrales.reduce((s, b) => s + b.length, 0);
  const fin = new DataView(new ArrayBuffer(22));
  const n = Object.keys(archivos).length;
  fin.setUint32(0, 0x06054b50, true); fin.setUint16(8, n, true); fin.setUint16(10, n, true);
  fin.setUint32(12, tamCentral, true); fin.setUint32(16, offset, true);
  const partes = [...locales, ...centrales, new Uint8Array(fin.buffer)];
  const total = partes.reduce((s, b) => s + b.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const b of partes) { out.set(b, p); p += b.length; }
  return out;
}
