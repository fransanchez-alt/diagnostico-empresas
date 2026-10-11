# Estado actual · v0.2.0 (11/10/2026)

## Hecho
- v0.1: método en JSON (8 áreas, 6 motivos, 6 fórmulas, 6 patrones), recorrido en 6 pasos, cuestionario del empresario, kit del arnés en .zip, informe imprimible, trabajo sin conexión. Hidrotex reproduce el Anexo A.
- v0.2 (29 tests):
  - Cuestionario anónimo del equipo (E1-E3): se importa, aparece junto al cruce «lo dicho frente al dato» y crea tarjetas.
  - Semanas trabajadas al año: 45 por defecto, ajustable por caso.
  - Tiempo del equipo frente a dinero: titular con dos cifras separadas, hipótesis fuera del titular, ventas sin margen avisadas como cota alta.
  - Esfuerzo, % que resuelve, inversión y coste al mes → ahorro y meses para recuperar la inversión.
  - Regla de proceso fijo para P4 y P5, y ayuda de tres preguntas para elegir el destino.
  - Hoja de ruta en tres horizontes, ajustable.
  - Excel de cálculos con fórmulas vivas (js/xlsx.js, sin dependencias).
  - Leyenda [E]/[C]/[S] al pie del informe.

## Siguiente
- Diseño visual (pendiente a propósito).
- Probarla con un caso real y revisar los descriptores de las 8 áreas.
- Cifrado local con contraseña (v0.3).

## Ideas para después
- Revisión (RF-23): repetir la exploración y comparar A inicial, A actual y B.
- Modo alumno con el ejemplo de Hidrotex en cada paso.
