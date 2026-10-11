# AGENTS.md · Herramienta de diagnóstico A → B

## Qué es
Web local (sin servidor) para diagnosticar empresas: motivo de consulta → exploración (punto A) → analítica (coste) → diagnóstico (punto B, matriz dolor × euros, cruces, DAFO) → tratamiento (orden y kit del arnés) → informe.
La especificación es `docs/metodo.md` (Parte I: método; Parte II: requisitos R1-R14).

## Reglas
- Lee `docs/metodo.md` y `progress/actual.md` antes de tocar nada.
- Sin servidor, sin cuentas, sin IA dentro, sin llamadas a internet: ningún dato del caso sale del dispositivo.
- HTML + CSS + JavaScript con módulos, sin framework ni compilación. Sin dependencias externas (el .zip lo genera `js/zip.js`).
- El contenido del método vive en `content/` (JSON y plantillas .md). Cambia el método ahí, no en el código.
- La lógica de cálculo va en `js/logic.js` y `js/kit.js`, sin DOM, y cada regla tiene su test en `tests/`.
- Escribe el test antes que el cambio. `node --test tests/*.test.mjs` tiene que pasar entero.
- Diseño móvil primero: nada de scroll horizontal a 360 px; objetivos táctiles de 44 px.
- Todo texto visible en español llano; cada paso con su ayuda (qué, por qué, cómo, ejemplo).
- Si añades archivos estáticos, añádelos también a la lista de `sw.js` y sube `VERSION`.

## Comandos
- Probar en local: `python3 -m http.server 8000` y abrir http://localhost:8000
- Tests: `node --test tests/*.test.mjs`
