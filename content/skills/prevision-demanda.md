---
name: prevision-demanda
description: "Patrón P2 · Previsión de demanda. Úsala cuando la tarea del proyecto sea de este tipo."
---

# Previsión de demanda

**Requisitos previos:** Datos de ventas revisados (P1) y al menos dos temporadas de histórico.

## Cómo trabajar
1. Parte siempre de los datos ya revisados (patrón P1).
2. Calcula primero la regla que usa hoy la empresa: es el punto de comparación.
3. Reserva los últimos meses para comprobar; no los uses para ajustar.
4. Compara el error de las dos previsiones y recomienda la que se equivoque menos, explicando por qué.

## Cómo se verifica
Se equivoca menos que la regla que usa hoy la empresa (por ejemplo, «lo mismo que el año pasado»).

**Umbral:** Error medio menor que el de la regla actual; si no, se recomienda la regla.

## Riesgos que vigilar
- Prometer una precisión que no tiene.
- Productos nuevos dados de alta con la misma referencia que los antiguos.
