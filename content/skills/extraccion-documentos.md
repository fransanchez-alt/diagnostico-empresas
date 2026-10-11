---
name: extraccion-documentos
description: "Patrón P4 · Extracción de documentos a datos. Úsala cuando la tarea del proyecto sea de este tipo."
---

# Extracción de documentos a datos

**Requisitos previos:** Una muestra de documentos reales (facturas, albaranes) sin datos personales o anonimizados.

## Cómo trabajar
1. Extrae los campos acordados de cada documento.
2. Guarda el resultado en un JSON intermedio que una persona revisa.
3. Marca como dudoso todo lo que no se lea con claridad; nunca inventes un valor.

## Cómo se verifica
Los campos extraídos coinciden con la revisión humana; los dudosos se marcan.

**Umbral:** Al menos el 95 % de los campos correctos y el 100 % de los dudosos marcados.

## Riesgos que vigilar
- Errores silenciosos en importes.
- Datos personales en los documentos.
