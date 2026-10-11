---
name: revision-datos
description: "Patrón P1 · Revisión y limpieza de datos. Úsala cuando la tarea del proyecto sea de este tipo."
---

# Revisión y limpieza de datos

**Requisitos previos:** Acceso a una exportación de los datos (CSV o Excel).

## Cómo trabajar
1. Lee el fichero sin modificarlo y muestra filas, columnas y tipos.
2. Comprueba duplicados, fechas, importes y referencias, uno por uno, con un test para cada comprobación.
3. Genera el informe en lenguaje sencillo: qué está mal, cuántas veces, dónde y cómo arreglarlo.
4. Nunca corrijas el original: si se pide una versión limpia, escríbela aparte.

## Cómo se verifica
Detecta todos los errores de una tabla de ejemplos con errores sembrados.

**Umbral:** Detecta todos los errores de la tabla.

## Riesgos que vigilar
- Corregir datos sin avisar a nadie.
- Tocar el sistema original de la empresa.
