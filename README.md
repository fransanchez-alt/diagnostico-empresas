# Diagnóstico de empresas A → B

Herramienta web para diagnosticar una empresa como en una consulta médica: qué le pasa, dónde está (punto A), dónde quiere llegar (punto B), cuánto le cuesta cada problema, qué hacer primero y, para lo que haya que construir, el **kit del arnés** listo para OpenCode.

- Funciona en el móvil, la tableta y el ordenador, también **sin conexión** (se puede instalar como app).
- **Los casos se guardan solo en tu dispositivo.** No hay servidor ni cuentas. Para pasar un caso a otro equipo: Exportar → Importar.
- Sin IA dentro: la IA entra después, en OpenCode, con el kit descargado.

## Cómo se usa
1. Crea un caso (o abre el ejemplo de Hidrotex).
2. **Motivo:** elige el motivo de consulta, descarga el cuestionario para el empresario y luego importa sus respuestas (o rellénalas tú en la visita).
3. **Exploración:** sitúa cada área en su nivel, con evidencia.
4. **Analítica:** escribe los problemas y calcula su coste con la operación a la vista.
5. **Diagnóstico:** acordad el punto B; revisa el gráfico, la matriz dolor × euros, los cruces y el DAFO.
6. **Tratamiento:** revisa el orden propuesto, elige destino y patrón y descarga el kit.
7. **Informe:** imprime o guarda en PDF.

## Para ponerla en marcha
Necesita servirse desde una dirección web (no vale abrir `index.html` con doble clic):
- En local: `python3 -m http.server 8000` → http://localhost:8000
- Publicada: GitHub Pages (Settings → Pages → rama `main`, carpeta raíz).

## Estructura
- `index.html`, `css/`, `js/` · la aplicación (`logic.js` y `kit.js` son lógica pura con tests).
- `content/` · el método: áreas, motivos, fórmulas, patrones, ayudas y plantillas del arnés.
- `casos/hidrotex.json` · caso de ejemplo.
- `docs/metodo.md` · método y requisitos (la especificación).
- `tests/` · criterios de aceptación y tabla de ejemplos (`node --test tests/*.test.mjs`).
