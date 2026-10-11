// Genera el formulario del empresario: un único HTML independiente que se manda por correo o WhatsApp.
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function preguntasFormulario(caso, ctx) {
  const { base, motivos, areas, enJuego } = ctx;
  const bloques = [{ titulo: 'Vuestra empresa', preguntas: base.preguntasEmpresario }];
  (caso.motivos || []).forEach((id) => {
    const m = motivos.find((x) => x.id === id);
    if (m) bloques.push({ titulo: m.titulo, preguntas: m.preguntas });
  });
  if (caso.chequeoGeneral) {
    bloques.push({ titulo: 'Un repaso general', preguntas: areas.map((a) => ({ id: `CHK-${a.id}`, texto: a.chequeo })) });
  }
  const auto = areas.filter((a) => enJuego.includes(a.id));
  return { bloques, auto };
}

export function generarFormulario(caso, ctx) {
  const { bloques, auto } = preguntasFormulario(caso, ctx);
  const nombre = (caso.empresa && caso.empresa.nombre) || 'vuestra empresa';
  const clave = `formulario-${caso.id}`;
  const preguntasHtml = bloques.map((b) => `
  <section><h2>${esc(b.titulo)}</h2>
  ${b.preguntas.map((p) => `<label class="q"><span class="n">${esc(p.id)}</span> ${esc(p.texto)}
    <textarea data-id="${esc(p.id)}" rows="3"></textarea></label>`).join('')}
  </section>`).join('');
  const autoHtml = auto.length ? `
  <section><h2>¿Cómo os veis?</h2>
  <p class="nota">Para cada tema, marca la frase que mejor describe cómo trabajáis hoy. No hay respuestas buenas ni malas.</p>
  ${auto.map((a) => `<fieldset><legend>${esc(a.nombre)}</legend>
    ${a.niveles.map((n, i) => `<label class="opt"><input type="radio" name="auto-${a.id}" value="${i + 1}" data-auto="${a.id}"> ${esc(n)}</label>`).join('')}
    <label class="opt"><input type="radio" name="auto-${a.id}" value="" data-auto="${a.id}"> No lo sé</label>
  </fieldset>`).join('')}
  </section>` : '';

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cuestionario · ${esc(nombre)}</title>
<style>
:root{--ink:#1d2433;--muted:#5b6475;--line:#d9dde5;--accent:#e06a00;--bg:#f7f5f0;--card:#fff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:720px;margin:0 auto;padding:20px 16px 120px}h1{font-size:1.5rem;margin:.2em 0}h2{font-size:1.15rem;margin:1.6em 0 .6em;border-bottom:2px solid var(--accent);padding-bottom:4px}
.aviso{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:12px 14px}
.aviso li{margin:.3em 0}.q{display:block;margin:14px 0}.n{display:inline-block;font-weight:700;color:var(--accent);min-width:3.2em}
textarea{display:block;width:100%;margin-top:6px;padding:10px;border:1px solid var(--line);border-radius:8px;font:inherit;background:var(--card)}
fieldset{border:1px solid var(--line);border-radius:8px;margin:12px 0;padding:8px 12px;background:var(--card)}legend{font-weight:700;padding:0 4px}
.opt{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-top:1px solid #eef0f4}.opt:first-of-type{border-top:0}.opt input{margin-top:5px;width:20px;height:20px;flex:none}
.nota{color:var(--muted)}.barra{position:fixed;left:0;right:0;bottom:0;background:var(--card);border-top:1px solid var(--line);padding:10px 16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
button{font:inherit;font-weight:600;padding:12px 18px;border-radius:10px;border:1px solid var(--ink);background:var(--ink);color:#fff;min-height:48px}
button.sec{background:#fff;color:var(--ink)}#estado{width:100%;text-align:center;color:var(--muted);font-size:.9rem}
</style></head><body><main>
<h1>Cuestionario para ${esc(nombre)}</h1>
<div class="aviso"><p><strong>Se contesta en unos 10 minutos.</strong> Contesta con tus palabras, como si me lo contaras por teléfono.</p>
<ul><li><strong>«No lo sé» es mejor que un dato inventado.</strong></li><li><strong>Los números aproximados valen</strong> («unas 3 horas a la semana»).</li>
<li><strong>No escribas datos de tus clientes</strong>: ni nombres, ni teléfonos, ni facturas, ni contraseñas. Solo cómo trabajáis.</li>
<li>Lo que escribas se guarda solo en tu dispositivo hasta que pulses «Enviar mis respuestas».</li></ul></div>
${preguntasHtml}
${autoHtml}
</main>
<div class="barra"><button id="copiar">Copiar mis respuestas</button><button id="bajar" class="sec">Descargar archivo</button><div id="estado">Guardado automático activado.</div></div>
<script>
(function(){
var CLAVE=${JSON.stringify(clave)};
var META=${JSON.stringify({ caso: caso.id, empresa: nombre, motivos: caso.motivos || [] })};
function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(datos()))}catch(e){}document.getElementById('estado').textContent='Guardado en este dispositivo.'}
function datos(){var r={},a={};document.querySelectorAll('textarea[data-id]').forEach(function(t){if(t.value.trim())r[t.dataset.id]=t.value.trim()});
document.querySelectorAll('input[data-auto]:checked').forEach(function(i){if(i.value)a[i.dataset.auto]=Number(i.value)});
return {tipo:'respuestas-empresario',version:'0.1',caso:META.caso,empresa:META.empresa,motivos:META.motivos,fecha:new Date().toISOString(),respuestas:r,autoniveles:a}}
function cargar(){try{var d=JSON.parse(localStorage.getItem(CLAVE)||'null');if(!d)return;
Object.keys(d.respuestas||{}).forEach(function(k){var t=document.querySelector('textarea[data-id="'+k+'"]');if(t)t.value=d.respuestas[k]});
Object.keys(d.autoniveles||{}).forEach(function(k){var i=document.querySelector('input[data-auto="'+k+'"][value="'+d.autoniveles[k]+'"]');if(i)i.checked=true})}catch(e){}}
cargar();document.addEventListener('input',guardar);document.addEventListener('change',guardar);
document.getElementById('copiar').onclick=function(){var txt=JSON.stringify(datos());
function ok(){document.getElementById('estado').textContent='Copiado. Pégalo en un correo o un WhatsApp y envíalo.'}
if(navigator.clipboard){navigator.clipboard.writeText(txt).then(ok,function(){fallback(txt);ok()})}else{fallback(txt);ok()}};
function fallback(txt){var t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e){}t.remove()}
document.getElementById('bajar').onclick=function(){var b=new Blob([JSON.stringify(datos(),null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='respuestas-'+META.caso+'.json';a.click();document.getElementById('estado').textContent='Archivo descargado. Envíalo por correo o WhatsApp.'};
})();
</script></body></html>`;
}

// Lee lo que devuelve el empresario (texto copiado o archivo).
export function leerRespuestas(texto) {
  const m = String(texto || '').match(/\{[\s\S]*\}/);
  if (!m) throw new Error('No encuentro las respuestas en el texto pegado.');
  const d = JSON.parse(m[0]);
  if (d.tipo !== 'respuestas-empresario') throw new Error('Esto no parece un cuestionario de la herramienta.');
  return d;
}
