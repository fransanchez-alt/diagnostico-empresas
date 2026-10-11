# Método de diagnóstico de empresas · v0.1

**Herramienta de diagnóstico A → B** (nombre provisional)
Borrador para revisión · 11 de octubre de 2026 · Fran Sánchez

---

## 0. Cómo leer este documento

Este documento es dos cosas a la vez:

- **Parte I · El método.** Qué se pregunta, cómo se puntúa, cómo se calcula y cómo se decide. Es el contenido de la herramienta y sirve igual en papel.
- **Parte II · Los requisitos de la herramienta.** Escritos con la plantilla de toma de requisitos del curso (R1-R14, Dado/Cuando/Entonces, tabla de ejemplos con umbral). Es la especificación que leerá el agente para construir la web.
- **Anexo A · Hidrotex por el método.** El caso de prueba, de principio a fin.

Convenciones que se usan en todo el documento:

- **[E]** dato que declara la empresa · **[C]** dato que comprueba el consultor · **[S]** supuesto o hipótesis.
- **Sin datos**: el aspecto aplica, pero no se sabe. **No aplica**: no tiene sentido en esta empresa. Ninguno de los dos cuenta en medias ni en sumas.
- **[PENDIENTE: …]**: hueco que la herramienta deja marcado cuando falta información.

---

# PARTE I · EL MÉTODO

## 1. Principios

1. **No reinventar la rueda.** Cada pieza del método se apoya en una metodología conocida y aceptada (apartado 9). La herramienta las usa por dentro; no las enseña como teoría.
2. **Sin evidencia no hay nivel.** Cada nivel lleva la respuesta o la observación que lo justifica.
3. **Toda cifra con la operación a la vista** y con su origen [E], [C] o [S]. Una hipótesis nunca se presenta con el formato de un dato y nunca va en el titular.
4. **Prudencia en los números.** Se redondea hacia abajo y se usa la parte baja de los rangos declarados. Una cifra prudente que la empresa reconoce vale más que una espectacular.
5. **La herramienta recomienda; la persona decide.** El orden de prioridades es una propuesta; el consultor lo puede cambiar dejando escrito el motivo.
6. **Lo que duele no siempre es lo que cuesta.** El dolor del empresario se escucha y se registra, pero el orden lo deciden los euros (apartado 6.5).
7. **Datos de terceros, fuera.** Solo se trabaja con procesos, herramientas y cifras agregadas. Nunca listados de clientes, fichas, contraseñas ni accesos.
8. **Honesto, no cruel.** Cada debilidad sale con su posible solución al lado, y siempre hay una sección de lo que **no** conviene tocar todavía.
9. **No todo se resuelve programando.** Cada problema recibe uno de tres destinos: OpenCode construye, OpenCode asiste o no hace falta agente.
10. **La herramienta guía y explica.** En cada paso dice, en lenguaje sencillo, qué se hace, por qué importa y cómo se hace, con un ejemplo. Quien la use por primera vez (un alumno, un empresario que se autoevalúa) debe poder seguirla sin formación previa; quien ya la conoce puede ocultar las ayudas.

## 2. El recorrido: una consulta médica

| Fase | Pregunta que responde | Quién | Estación de la línea | Metodologías en que se apoya |
|---|---|---|---|---|
| 1 · Motivo de consulta | ¿Qué le pasa y qué quiere conseguir? | Empresario (antes) + consultor | 1 · Conocer | Canvas de modelo de negocio, *jobs to be done*, 5 porqués |
| 2 · Exploración | ¿Dónde está hoy cada área? (punto A) | Consultor, con lo que contestó el empresario | 2 · Diagnosticar | Modelos de madurez (Rogers, Rewired, escalera de la analítica), SIPOC, recorrido del cliente |
| 3 · Analítica | ¿Cuánto cuesta cada problema? | Consultor | 2 · Diagnosticar | Pareto 80/20, cuadro de mando integral |
| 4 · Diagnóstico | ¿Dónde queremos llegar (punto B) y qué separa A de B? | Empresa + consultor | 2 · Diagnosticar | DAFO, OKR, objetivos SMART, Ishikawa |
| 5 · Tratamiento | ¿Qué hacemos primero y cómo? | Consultor (propone la herramienta) | 3 · Especificar y 4 · Preparar el arnés | Matriz impacto/esfuerzo, coste del retraso, MoSCoW, Canvas de IA, CRISP-DM, desarrollo guiado por especificaciones |
| 6 · Revisión | ¿Se ha acercado A a B? | Empresa + consultor | 6 · Entregar y decidir | Ciclo PDCA |

La fase 1 es obligatoria. La exploración puede hacerse **solo en las áreas del motivo** o, si el consultor lo decide, añadir el **chequeo general** de las 8 áreas (una pregunta por área).

---

## 3. Fase 1 · Motivo de consulta

### 3.1 Lo que contesta el empresario antes de la visita (≈10 minutos)

Preguntas numeradas (la numeración no cambia nunca, para poder citarlas):

| N.º | Pregunta |
|---|---|
| M1 | Nombre de la empresa y a qué os dedicáis, en una frase (la actividad real, no el epígrafe fiscal). |
| M2 | Cuántas personas trabajáis y qué hace cada una, a grandes rasgos. |
| M3 | ¿Qué os gustaría conseguir en los próximos 12 meses? Dilo con tus palabras. |
| M4 | Las 3 tareas que más tiempo os quitan cada semana, con las horas aproximadas de cada una. |
| M5 | Si pudieras arreglar una sola cosa mañana, ¿cuál sería? |
| M6 | ¿Cuánto os molesta hoy ese problema, del 1 (poco) al 5 (muchísimo)? |
| M7 | ¿Cuánto cuesta, más o menos, una hora de trabajo de quien hace esas tareas? (si prefieres no decirlo, déjalo en blanco) |
| M8 | ¿Qué presupuesto tendrías para arreglarlo? ¿Y al mes para mantenerlo? |
| M9 | ¿Hay algo que no se pueda tocar? (un programa, una persona, una forma de trabajar) |

Avisos que acompañan siempre al formulario: «"No lo sé" es mejor que un dato inventado», «los números aproximados valen» y «no mandes datos de tus clientes, ni facturas, ni contraseñas».

### 3.2 Lo que añade el consultor en la visita

1. **Canvas de modelo de negocio en una línea por bloque** (socios, actividades, recursos, propuesta de valor, relación, canales, segmentos, costes, ingresos). Sirve para entender dónde gana y dónde pierde dinero la empresa, y para detectar si el motivo toca una actividad clave o un coste importante.
2. **Elección del motivo de consulta** en el catálogo (3.3). Si no encaja ninguno, el consultor elige las áreas a mano.
3. **5 porqués** sobre el motivo, para pasar del síntoma a la causa. Ejemplo: «quiero más clientes» → ¿por qué? → «no me llaman» → ¿seguro? → «me llaman, pero no siempre contestamos» → la causa está en ventas y atención, no en marketing.

### 3.3 Catálogo inicial de motivos de consulta

Cada motivo es un protocolo: ya trae sus áreas, sus preguntas, sus indicadores, sus fórmulas y los patrones de solución más probables. El catálogo crece con cada empresa nueva.

**MC1 · «Quiero más clientes»**
- Áreas: clientes y marketing; ventas y atención.
- Preguntas al empresario: ¿por dónde os llegan los clientes nuevos? ¿Cuántos al mes? ¿Cuántas consultas se quedan sin contestar? ¿Cuántos clientes repiten?
- Exploración: recorrido del cliente desde que conoce la empresa hasta que vuelve; ¿se pierden contactos que ya llegan?
- Indicadores: clientes nuevos al mes y su origen; consultas sin atender a la semana; % de clientes que repiten.
- Fórmulas: F2 (clientes o ventas perdidas × margen).
- Patrones probables: captación y seguimiento de clientes; automatización de un proceso; asistente con documentos.
- Trampa típica: buscar clientes nuevos mientras se pierden los que ya pagaron.

**MC2 · «Pierdo dinero en compras o stock»**
- Áreas: operaciones, compras y stock; datos y medición.
- Preguntas: ¿cómo decides cuánto comprar? ¿Cuándo te quedaste sin un producto por última vez y qué pasó? ¿Qué se te queda parado en el almacén? ¿Hay fechas o descuentos de compra que importen?
- Exploración: de dónde salen los datos de ventas y de stock y en qué estado están.
- Indicadores: roturas de stock al año (veces o días); valor del stock parado.
- Fórmulas: F2, F3, F5.
- Patrones probables: revisión y limpieza de datos (primero), previsión de demanda.
- Trampa típica: pedir una previsión sin comprobar antes que los datos sirven.

**MC3 · «Se nos va el tiempo en tareas a mano»**
- Áreas: la del proceso afectado (frecuentes: cobro y finanzas; ventas y atención; operaciones).
- Preguntas: ¿qué tarea, quién la hace, cuántas horas a la semana? ¿Qué documentos o programas usa?
- Exploración: dibujar el proceso (SIPOC: proveedores, entradas, proceso, salidas, clientes) y marcar los pasos manuales.
- Indicadores: horas a la semana en tareas repetitivas.
- Fórmulas: F1.
- Patrones probables: automatización de un proceso; extracción de documentos a datos.
- Trampa típica: automatizar un proceso que está mal diseñado; a veces basta con cambiar el proceso.

**MC4 · «Dependo de una persona»**
- Áreas: personas y conocimiento; ventas y atención.
- Preguntas: ¿qué pasa si esa persona falta un mes? ¿Qué sabe ella que no está escrito? ¿Hay fecha de salida (jubilación, cambio)?
- Exploración: dónde está el conocimiento (documentos, cabeza, fichas) y si está al día.
- Indicadores: tareas críticas que solo sabe una persona; consultas que solo ella resuelve.
- Fórmulas: F1 (horas de otros esperando o resolviendo peor) y F6 (riesgo, siempre como hipótesis).
- Patrones probables: asistente con documentos; procedimientos escritos (sin agente).
- Trampa típica: creer que una IA sustituye a la persona sin antes ordenar la documentación.

**MC5 · «No sé si mis datos sirven»**
- Áreas: datos y medición; seguridad y protección de datos.
- Preguntas: ¿dónde están vuestros datos? ¿Desde cuándo? ¿Qué números miráis cada mes? ¿Ha pasado algo raro con ellos (cortes, cambios de programa, retoques a mano)?
- Exploración: inventario de fuentes de datos con semáforo (existe · está completa · es fiable · quién la tiene).
- Indicadores: indicadores que se revisan cada mes; errores encontrados por cada 100 filas (si se revisa).
- Fórmulas: normalmente no tiene coste propio; su valor está en lo que desbloquea (regla de base, 7.1).
- Patrones probables: revisión y limpieza de datos.
- Trampa típica: el dueño cree que sus datos están bien y los empleados cuentan otra cosa.

**MC6 · «Quiero formar a mi equipo»**
- Áreas: personas y conocimiento; uso actual de IA.
- Preguntas: ¿formar en qué y para qué? ¿Qué tarea quieres que hagan mejor o más rápido? ¿Cuántas horas podéis dedicar?
- Exploración: qué usan ya (incluida la IA que usan por su cuenta) y con qué normas.
- Indicadores: horas de formación por persona y año; tareas en que se usa IA con normas claras.
- Fórmulas: F1 (horas que se ahorrarán frente a horas de formación).
- Patrones probables: OpenCode asiste (materiales, prácticas guiadas); sin agente (plan de formación y normas de uso de IA).
- Trampa típica: formar en herramientas sin una tarea concreta en la que aplicarlas.

---

## 4. Fase 2 · Exploración: las 8 áreas y sus niveles (punto A)

Escala común (inspirada en los modelos de madurez digital y en la escalera de la analítica):

| Nivel | Nombre | Idea |
|---|---|---|
| 1 | Artesanal | Papel, cabeza o memoria de una persona |
| 2 | Herramientas sueltas | WhatsApp, Excel y correo, sin conexión entre ellos |
| 3 | Digitalizado a mano | Hay herramienta, pero todo lo mueve una persona |
| 4 | Conectado y medido | Las herramientas se hablan y hay números que se miran |
| 5 | Automatizado y predictivo | Va solo, con alertas, y se anticipa con datos |

Reglas de puntuación:

- El nivel lo pone el **consultor**, a partir de lo que contesta la empresa y de lo que observa. La empresa también se puntúa en la autoevaluación; la diferencia entre las dos puntuaciones se muestra (es un cruce).
- **Se puntúa el proceso, no la herramienta.** Tener un programa no es nivel 3 si nadie lo usa; si lo mueve una persona a mano, es 3 como máximo.
- Si el global de áreas sale por encima de 3,5 en una pyme, se revisan las evidencias: casi siempre se ha premiado tener herramienta en lugar de tener proceso.
- Para cada área explorada se escribe **qué haría falta para subir un nivel**, en una frase concreta.

### 4.1 Descriptores por área

**A1 · Clientes y marketing**
1. Sin acciones; los clientes llegan por el boca a boca.
2. Web o redes sueltas, sin plan ni medición.
3. Acciones planificadas a mano; no se sabe de dónde viene cada cliente.
4. Se conoce el origen de cada cliente y lo que cuesta captarlo; clientes segmentados.
5. Captación y fidelización automatizadas y medidas; las decisiones se toman con datos.
- Indicadores: clientes nuevos al mes (y % de origen conocido); % de clientes que repiten.
- Chequeo general: «¿Sabéis de dónde viene cada cliente nuevo y cuántos repiten?»

**A2 · Ventas y atención**
1. Depende de quién atienda; no queda registro.
2. Teléfono y WhatsApp en móviles; presupuestos en Excel o Word.
3. Hay herramienta (agenda, CRM, programa), pero respuestas y seguimiento se hacen a mano.
4. Canales centralizados, respuestas tipo, seguimiento de presupuestos y consultas registradas.
5. Atención continua con respuestas automáticas supervisadas; conversión medida.
- Indicadores: consultas a la semana y % sin atender; tiempo medio de respuesta; % de presupuestos aceptados.
- Chequeo general: «¿Cuántas consultas se os quedan sin contestar a la semana?»

**A3 · Operaciones, compras y stock**
1. Se compra a ojo y de memoria.
2. Excel sueltos; el inventario no es fiable.
3. Programa de gestión con stock, pero los pedidos se deciden por intuición.
4. Stock fiable, mínimos y alertas; las compras se apoyan en el histórico.
5. Previsión de demanda y pedidos sugeridos automáticamente; roturas medidas.
- Indicadores: roturas de stock al año; valor del stock parado; horas a la semana en tareas manuales del proceso.
- Chequeo general: «¿Cómo decidís cuánto comprar y cada cuánto os quedáis sin algo?»

**A4 · Cobro y finanzas**
1. Papel; la gestoría lo hace todo y la empresa no ve los números.
2. Facturas en Word o Excel; los cobros pendientes no se siguen.
3. Programa de facturación; conciliación y reclamaciones a mano.
4. Facturación y cobro conectados; impagados en una lista; previsión de tesorería básica.
5. Cobros automáticos, avisos de impago solos y cuadro de mando financiero mensual.
- Indicadores: días medios de cobro; importe de impagados; horas al mes de administración.
- Chequeo general: «¿Sabéis hoy cuánto os deben y desde cuándo?»

**A5 · Personas y conocimiento**
1. El conocimiento está en la cabeza de una o dos personas; no hay formación.
2. Alguna instrucción suelta; formación ocasional.
3. Procedimientos escritos de lo principal; formación planificada, sin medir.
4. Base de conocimiento accesible y al día; plan de formación con seguimiento.
5. Conocimiento vivo (documentación y asistentes), formación medida por resultados; nadie es imprescindible.
- Indicadores: tareas críticas que solo sabe una persona; horas de formación por persona y año.
- Chequeo general: «Si mañana falta la persona que más sabe, ¿qué se para?»

**A6 · Datos y medición**
1. No se mira ningún número; los datos están en papel o en la cabeza.
2. Datos repartidos en varios sitios; se sacan a mano cuando hay un problema.
3. Un programa central e informes manuales periódicos; la calidad de los datos no se conoce.
4. Datos fiables en un sitio, revisados, y un cuadro de mando mensual.
5. Datos integrados, cuadro de mando en vivo con alertas y uso predictivo.
- Indicadores: indicadores que se revisan cada mes; errores por cada 100 registros (si se ha revisado).
- Chequeo general: «¿Qué números miráis cada mes para saber si el negocio va bien?»

**A7 · Seguridad y protección de datos**
1. Sin copias; accesos compartidos; datos de clientes en móviles personales.
2. Copias cuando alguien se acuerda.
3. Copia automática de lo principal; contraseñas compartidas.
4. Copias verificadas, acceso por persona y protección de datos en orden.
5. Lo anterior, más restauración probada, responsable identificado y formación.
- Indicadores: fecha de la última copia comprobada; personas con acceso a datos de clientes.
- Chequeo general: «Si mañana se rompe el ordenador principal, ¿qué perdéis?»

**A8 · Uso actual de IA**
1. Nada.
2. Uso individual y esporádico, sin normas, o se probó algo y se abandonó.
3. Alguna IA o automatización estable en una tarea concreta, sin control de calidad.
4. Varias en uso, con normas claras y datos protegidos.
5. Integrada en los procesos, con calidad medida y supervisión humana.
- Indicadores: tareas en que se usa IA; existencia de normas de uso (sí/no).
- Chequeo general: «¿Alguien usa ya alguna IA en el trabajo? ¿Para qué?»

---

## 5. Fase 3 · Analítica: cuánto cuesta cada problema

Cada problema se escribe como una **tarjeta** con la cadena del curso:

> **Problema** (con palabras de la empresa) → **Coste** (euros al año, con operación) → **Datos** (qué hay y en qué estado) → **Solución** (idea, todavía sin tecnología)

más dos campos: **área** a la que pertenece y **dolor** declarado (1-5, pregunta M6 o equivalente).

### 5.1 Fórmulas fijas

| Código | Qué mide | Operación | Si falta un dato |
|---|---|---|---|
| F1 | Horas a mano | h/semana × 4,3 × 12 × €/hora | Sin €/hora: solo horas al año |
| F2 | Ventas o clientes perdidos | importe perdido × margen bruto | Sin margen: se da el importe de ventas como dato [E] y se avisa de que el coste real es menor; el margen, si se supone, es [S] |
| F3 | Stock parado | valor del stock parado × coste anual de tenerlo (financiero, almacén, obsolescencia) | Sin coste anual declarado: solo el valor inmovilizado |
| F4 | Consumos y gastos evitables | gasto anual × % de reducción esperado | El % casi siempre es [S]: va como hipótesis, nunca en el titular |
| F5 | Ventajas perdidas | importe de compra × % de descuento o bonificación perdida | Sin importe: sin datos |
| F6 | Riesgos | probabilidad × impacto | Siempre [S]; se muestra aparte de los costes |

Reglas:

- Semanas a mes: × 4,3. Mes a año: × 12. Se redondea hacia abajo, al final del cálculo.
- De un rango declarado («3 o 4»), se usa el valor bajo.
- La operación se muestra completa, con el origen de cada número. Ejemplo: `Consultas técnicas: 30/día [E] × 5 min [E] = 150 min/día = 2,5 h/día × 5 días × 4,3 = 53 h/mes [cálculo]`.
- Un problema sin ninguna cifra queda **sin datos** en euros; no se le inventa un coste. Sigue en el diagnóstico, pero no puede encabezar el orden por retorno.

### 5.2 Inventario de datos

Para cada fuente de datos que aparece (programa de gestión, Excel, móviles, carpetas): qué contiene, desde cuándo, quién la tiene y un semáforo con tres preguntas: ¿existe? ¿está completa? ¿es fiable? Las pistas de errores se anotan con su origen. Este inventario alimenta el área A6 y decide la viabilidad de los patrones que necesitan datos.

---

## 6. Fase 4 · Diagnóstico: punto A frente a punto B

### 6.1 Cómo se fija el punto B

Lo acuerdan la empresa y el consultor en la visita. La herramienta no lo propone.

- **Objetivo general en palabras**, que encabeza el diagnóstico (de M3, afinado como objetivo SMART: concreto, medible y con fecha).
- Para cada **área explorada**: nivel objetivo (1-5) a 12-18 meses e **importancia** para esta empresa (alta, media o baja).
- Para cada **indicador** con valor actual: valor objetivo (por ejemplo, «consultas sin atender: de 10 a menos de 2 a la semana»), al estilo de los resultados clave de un OKR.
- El nivel 5 aparece siempre como **referencia ideal**, pero no es obligatorio alcanzarlo.

### 6.2 Brecha, fortalezas, debilidades y urgencias

- **Brecha** de un área = nivel objetivo − nivel actual. Las áreas no exploradas no tienen brecha: aparecen como «no explorada», nunca como cero.
- **Fortaleza**: área en su objetivo o por encima.
- **Debilidad**: área con brecha ≥ 2, o brecha 1 con importancia alta.
- **Urgencia**: riesgo crítico, aunque el área pese poco. Lista inicial: sin copias de los datos de los que vive el negocio; datos personales de clientes fuera de control; dependencia total de una persona que se va en menos de 12 meses (si es más tarde, es una debilidad de importancia alta); un incumplimiento legal evidente.

### 6.3 DAFO automático

| | Interno | Externo |
|---|---|---|
| **Positivo** | Fortalezas (6.2) | Oportunidades: patrones de solución aplicables con retorno, y lo que el consultor anote del sector |
| **Negativo** | Debilidades (6.2) | Amenazas: urgencias, competencia y regulación que anote el consultor (PESTEL y 5 fuerzas como guía) |

### 6.4 Cruces

Los hallazgos más valiosos salen de comparar dos fuentes. La herramienta propone revisar estos cruces y el consultor marca los que se cumplen, con las dos evidencias:

| Cruce | Fuente 1 | Fuente 2 |
|---|---|---|
| El autodiagnóstico optimista | Nivel que se pone la empresa | Nivel que valida el consultor |
| Lo dicho frente al dato | Lo que cree el dueño («los datos están bien») | Lo que muestran los datos o cuentan los empleados |
| El objetivo equivocado | Lo que pide (clientes nuevos) | Lo que pierde (clientes que no repiten, consultas sin atender) |
| La promesa imposible | Lo que se promete al cliente | Lo que el proceso puede cumplir |
| El canal que nadie atiende | Canales que se anuncian | Quién los atiende y cuándo |
| La herramienta fantasma | Programas que se pagan | Programas que se usan |
| El imprescindible | «Aquí todos saben de todo» | Tareas que solo sabe una persona |
| Dolor frente a euros | Lo que más le molesta | Lo que más le cuesta (6.5) |

### 6.5 Matriz dolor × euros

Cada tarjeta se coloca según su dolor (1-5) y su coste anual. El umbral entre «cuesta mucho» y «cuesta poco» lo fija el consultor para cada empresa (por defecto, el 1 % de la facturación anual o, si no se conoce, la mediana de los costes calculados).

| | Cuesta mucho | Cuesta poco |
|---|---|---|
| **Duele mucho (4-5)** | **Primero.** Se aborda en el orden por retorno | **Se explica con cifras.** Solo se aborda si es muy barato y rápido (el papel higiénico) |
| **Duele poco (1-3)** | **Lo que no ves y te está costando.** Se presenta con su operación (la climatización de una nave de 3.000 m²) | **Aparcado**, con su destino |

El dolor no decide el orden, pero sirve para dos cosas: elegir el **primer quick win** (algo que la empresa note en dos semanas) y saber **cómo comunicar** cada propuesta.

### 6.6 Lo que no conviene tocar todavía

Sección obligatoria del diagnóstico, con dos o tres puntos y su motivo. Ejemplos: lo que depende de datos que aún no son fiables; lo que la empresa probó y salió mal sin entender por qué; usos de IA de alto riesgo o con datos personales sin control; automatizar un proceso que antes hay que rediseñar.

---

## 7. Fase 5 · Tratamiento

### 7.1 Regla de prioridad (propuesta automática, siempre visible)

La herramienta ordena las tarjetas en tres escalones y explica en una línea por qué cada una está donde está:

1. **Estabilizar.** Primero, las urgencias (6.2), aunque cuesten poco.
2. **Bases.** Después, lo que otros problemas necesitan para poder resolverse. La herramienta lo sabe porque cada patrón declara sus requisitos previos (por ejemplo, la previsión de demanda exige datos de ventas fiables, así que la revisión de datos va antes).
3. **Retorno.** El resto, de mayor a menor coste anual, o de mayor a menor coste ÷ inversión cuando la inversión está estimada, corregido por **viabilidad**:
   - viable: hay datos, cabe en el presupuesto (M8) y no toca lo intocable (M9);
   - parcial: falta algo que se puede conseguir;
   - no viable ahora: pasa a «lo que no conviene tocar todavía».

Dentro de cada escalón, a igualdad, va antes lo que se nota en dos semanas. Las tarjetas sin euros van al final del escalón 3, salvo que sean urgencia o base.

El consultor puede mover cualquier tarjeta; la herramienta le pide una frase con el motivo y la conserva en el informe.

### 7.2 Los tres destinos

| Destino | Cuándo | Qué entrega la herramienta |
|---|---|---|
| **OpenCode construye** | Hace falta software a medida | Ficha de tratamiento + kit completo del arnés |
| **OpenCode asiste** | Un análisis puntual o un trabajo que hace una persona con ayuda del agente | Ficha de tratamiento + kit ligero (AGENTS.md, contexto y comandos) |
| **No hace falta agente** | Cambiar un proceso, contratar una herramienta existente, empezar a registrar datos, formar | Ficha de tratamiento con los pasos; sin kit |

### 7.3 Catálogo inicial de patrones de solución

Cada patrón es una plantilla de solución que ya se ha visto funcionar. Declara qué necesita y cómo se verifica.

| Patrón | Áreas típicas | Requisitos previos | Verificación típica (umbral) | Riesgos |
|---|---|---|---|---|
| P1 · Revisión y limpieza de datos | A6 | Acceso a una exportación de los datos | Detecta todos los errores de una tabla de ejemplos sembrada | Corregir sin avisar; tocar el sistema original |
| P2 · Previsión de demanda | A3 | P1 hecho; histórico suficiente | Se equivoca menos que la regla actual («lo mismo que el año pasado») | Prometer precisión; cambios de producto en la misma referencia |
| P3 · Asistente con documentos | A2, A5 | Documentos ordenados y al día | Tabla de preguntas reales: responde bien y cita la fuente en el umbral fijado; cuando no sabe, lo dice | Inventar respuestas; documentos obsoletos |
| P4 · Extracción de documentos a datos | A4, A3 | Muestra de documentos reales | Campos extraídos que coinciden con la revisión humana en el umbral; los dudosos se marcan | Errores silenciosos en importes |
| P5 · Automatización de un proceso | Cualquiera | Proceso dibujado y estable | El proceso hace lo mismo que la persona en los casos de la tabla, y avisa cuando algo falla | Automatizar un proceso mal diseñado; acciones irreversibles sin confirmación |
| P6 · Captación y seguimiento de clientes | A1, A2 | Registro de clientes y consultas | Detecta a los clientes de la tabla que deberían recibir aviso | Datos personales; mensajes no deseados |

### 7.4 Ficha de tratamiento

Una por cada problema que se decide abordar:

- Problema, área, dolor, coste con su operación y origen de cada dato.
- Indicador A → B que medirá el éxito.
- Destino y patrón.
- Requisitos previos y si están cumplidos.
- Restricciones: presupuesto (M8), lo que no se toca (M9), datos que no pueden salir.
- Preguntas abiertas: todo lo que quedó **sin datos**.
- Primer paso concreto.

### 7.5 El kit del arnés

Para los destinos «OpenCode construye» (kit completo) y «OpenCode asiste» (kit ligero), la herramienta descarga una carpeta con **todos los archivos del arnés ya rellenados** con el contexto del caso. Lo que no se sabe queda como `[PENDIENTE: …]`.

| Archivo | Capa del arnés | Con qué se rellena | Kit ligero |
|---|---|---|---|
| `AGENTS.md` | Reglas | Empresa en una línea, objetivo del proyecto, restricciones (M8, M9), reglas de datos, stack del patrón, comandos; máximo 40 líneas | Sí |
| `docs/cliente.md` | Cliente | M1-M9, Canvas en una línea por bloque, motivo de consulta y 5 porqués | Sí |
| `docs/diagnostico.md` | Cliente | Áreas exploradas (A, B, brecha), tarjeta del problema con operación, cruces, matriz dolor × euros, lugar en el orden y su motivo | Sí |
| `docs/requisitos.md` | Cliente | R1-R14 prerrellenado: R1 problema, R2 métrica (indicador A → B), R6 alcance, requisitos funcionales del patrón, R13 riesgos del patrón, R14 preguntas abiertas | No |
| `specs/aceptacion.md` | Cliente | Criterios Dado/Cuando/Entonces de plantilla del patrón, adaptados al caso | No |
| `specs/ejemplos.md` | Verificación | Tabla de ejemplos y umbral del patrón (7.3) | No |
| `progress/actual.md` | Memoria | Estado inicial: «Tarea 1: …» según el primer paso de la ficha | Sí |
| `progress/lecciones.md` | Lecciones | Vacío, con el formato de lección → test, skill, regla o memoria | Sí |
| `.opencode/commands/plan.md`, `verificar.md`, `cerrar.md` | Comandos | Plantillas comunes, con la ruta de los documentos del caso | Sí |
| `.agents/skills/<patrón>/SKILL.md` | Skills | La skill del patrón elegido | No |
| `tests/README.md` e `init.sh` | Verificación | Esqueleto de verificación del patrón y comprobación de entorno | No |
| `datos/LEEME.md` | Terreno | Qué datos hacen falta, en qué formato y la regla: nunca datos reales en servicios no autorizados | Sí |

Este reparto sigue el arnés de 7 capas del curso (terreno, reglas, cliente, memoria, comandos, skills y verificación) más el apartado de lecciones.

---

## 8. Fase 6 · Revisión

Ciclo PDCA (planificar, hacer, verificar, actuar). A los 3-6 meses, o al cerrar cada tratamiento:

- Se repite la exploración de las áreas tratadas y se vuelven a medir los indicadores.
- La herramienta muestra A inicial, A actual y B en el mismo gráfico.
- Lo aprendido se lleva al método: nuevos motivos de consulta, nuevos descriptores y nuevos patrones (la «cosecha» del arnés).

---

## 9. Fuentes metodológicas

Lo que tomamos de cada una y dónde se usa. (Versiones a contrastar antes de cerrar la v1.0.)

| Metodología | Autoría y origen | Qué tomamos | Dónde |
|---|---|---|---|
| Canvas de modelo de negocio | Osterwalder y Pigneur, 2010 | Los 9 bloques para entender cómo gana dinero la empresa | 3.2 |
| Canvas de propuesta de valor | Osterwalder y otros, 2014 | Encaje entre lo que necesita el cliente y lo que ofrece la empresa | MC1 |
| *Jobs to be done* | Christensen y otros | Pasar de «qué pide» a «qué trabajo quiere resolver» | 3.1, M3-M5 |
| 5 porqués | Sistema de producción de Toyota | Del síntoma a la causa | 3.2 |
| Diagrama de Ishikawa | Kaoru Ishikawa | Causas agrupadas cuando hay varias | 6 (cruces) |
| Pareto 80/20 | Vilfredo Pareto; Joseph Juran en calidad | Pocos problemas concentran la mayor parte del coste | 5, 7.1 |
| SIPOC | Six Sigma | Dibujar un proceso antes de automatizarlo | MC3, P5 |
| Mapa de flujo de valor | Rother y Shook, 1999 (Lean) | Marcar pasos manuales y esperas | MC3 |
| Mapa del recorrido del cliente | Diseño de servicios | Ver dónde se pierden clientes | MC1 |
| 5 dominios de la transformación digital | David L. Rogers, 2016 | Áreas y madurez digital | 4 |
| *Rewired* | McKinsey, 2023 | Transformación ligada a resultados de negocio | 4, 6.1 |
| Escalera de la analítica | Descriptiva → diagnóstica → predictiva → prescriptiva | Niveles 3-5 del área de datos | A6 |
| Modelos de madurez digital para pymes | Diagnósticos públicos (p. ej. Acelera pyme) y privados | Escala 1-5 con descriptores | 4 |
| DAFO | Análisis estratégico clásico | Fortalezas, debilidades, oportunidades y amenazas | 6.3 |
| PESTEL y 5 fuerzas | Análisis del entorno; Michael Porter, 1979 | Guía para oportunidades y amenazas externas | 6.3 |
| Cuadro de mando integral | Kaplan y Norton, 1992 | Indicadores por área | 4, 5 |
| OKR y objetivos SMART | Andy Grove y John Doerr; George T. Doran, 1981 | Fijar el punto B medible | 6.1 |
| Matriz impacto/esfuerzo, ICE/RICE, coste del retraso, MoSCoW | Gestión de producto y proyectos (Reinertsen para el coste del retraso) | Regla de prioridad | 7.1 |
| Canvas de IA | Agrawal, Gans y Goldfarb, 2018 | Qué predicción, con qué datos y qué juicio humano | 7.3 |
| *Machine Learning Canvas* | Louis Dorard | Encaje de un proyecto de datos | 7.3 |
| CRISP-DM | Consorcio CRISP-DM, 1999-2000 | Fases de un proyecto de datos: entender el negocio y los datos antes de modelar | P1, P2 |
| Niveles de preparación de datos | Neil Lawrence, 2017 | Viabilidad según el estado de los datos | 5.2, 7.1 |
| Reglamento europeo de IA y RGPD | Reglamento (UE) 2024/1689 y Reglamento (UE) 2016/679 | Trampas y urgencias legales | 6.2, 6.6 |
| PDCA | Shewhart y Deming | Ciclo de revisión | 8 |
| Arnés del agente y desarrollo guiado por especificaciones | Práctica actual de ingeniería con agentes (curso UD4) | Kit de salida | 7.5 |
| Aprendizaje de practicantes | Práctica de consultoría y formación en auditoría de pymes | Autoevaluación + validación del mentor; evidencia obligatoria; cruces; formulario llano; lo que no conviene tocar; plan único | Todo el método |

Nota: las obligaciones de los sistemas de IA de alto riesgo del Reglamento europeo se han aplazado tras el acuerdo del «ómnibus digital» de 2026; la herramienta no da fechas legales, solo avisa del riesgo y remite a la norma vigente.

---

# PARTE II · REQUISITOS DE LA HERRAMIENTA

| | |
|---|---|
| **Cliente** | Fran Sánchez (primer usuario: consultor; después, alumnado de 2.º DAM) |
| **Solución** | Herramienta web de diagnóstico de empresas A → B, con salida a arnés |
| **Versión** | 0.1 · Estado: BORRADOR PARA REVISIÓN |

## R1 · Problema

Diagnosticar una empresa hoy depende del ojo del consultor: no hay un método común para cualquier sector, los problemas no se cuantifican de forma comprobable, se confunde lo que más molesta con lo que más cuesta y el paso del diagnóstico al proyecto (requisitos y arnés para el agente) se hace a mano cada vez.

## R2 · Objetivo y métricas

| Métrica | Hoy | Objetivo | Cómo se mide |
|---|---|---|---|
| Facilidad de uso | — | El empresario completa su formulario sin preguntar nada; un consultor novel completa el caso Hidrotex siguiendo solo las ayudas | Prueba con una persona ajena al proyecto |
| Tiempo hasta tener un diagnóstico de una página | Días, a mano | En la propia visita (≤ 90 min, con el formulario previo contestado) | Prueba con Hidrotex y con un caso real |
| Cifras con operación y origen | No sistemático | 100 % de las cifras del diagnóstico | Revisión del informe |
| Arnés listo para OpenCode | Montaje manual | Kit descargado sin tocar la estructura; solo quedan [PENDIENTE] reales | Abrir el kit en OpenCode y ejecutar `/plan` |
| Reproducibilidad | — | Hidrotex pasado por la herramienta da el resultado del Anexo A | Tabla R12 |

## R6 · Alcance

| Sí lo hará | No lo hará |
|---|---|
| Formulario previo para el empresario (M1-M9 y preguntas del motivo), que devuelve un archivo o texto importable | Acceder a ningún sistema, cuenta o programa de la empresa |
| Catálogo de motivos de consulta con sus áreas y preguntas | Proponer el punto B automáticamente por sector |
| Exploración de las áreas del motivo y, opcionalmente, chequeo general de las 8 | Obligar a contestar todas las áreas |
| Niveles 1-5 con descriptores, evidencia e indicadores | Usar IA dentro de la web |
| Tarjetas de problema con fórmulas F1-F6 y operación visible | Inventar cifras, márgenes o costes por hora |
| Punto B, brechas, fortalezas, debilidades, urgencias, DAFO, cruces y matriz dolor × euros | Dar dictámenes legales |
| Orden de prioridad propuesto y ajustable con motivo | Recomendar marcas concretas de producto |
| Ficha de tratamiento y descarga del kit del arnés | Construir la solución (eso lo hace OpenCode con el kit) |
| Informe de una página e informe completo, imprimibles | Guardar datos en servidores |
| Guardar casos en el dispositivo, exportar e importar | Gestionar usuarios o varios consultores a la vez (v1) |

## R7 · Requisitos funcionales

| Id | La herramienta debe… | Prioridad |
|---|---|---|
| RF-01 | Crear, abrir, duplicar y borrar casos (un caso = una empresa y una visita). | M |
| RF-02 | Generar el formulario del empresario para el motivo elegido, con preguntas numeradas, avisos de privacidad y botón «Copiar/descargar mis respuestas». | M |
| RF-03 | Importar las respuestas del empresario a un caso con un clic. | M |
| RF-04 | Permitir el modo entrevista: el consultor contesta todo en la visita si no hay formulario previo. | M |
| RF-05 | Ofrecer el catálogo de motivos (MC1-MC6) y la asignación manual de áreas. | M |
| RF-06 | Mostrar el Canvas de modelo de negocio para rellenar en una línea por bloque. | S |
| RF-07 | Explorar cada área con sus descriptores 1-5, pedir evidencia para guardar el nivel y registrar la autopuntuación de la empresa. | M |
| RF-08 | Activar u ocultar el chequeo general de las 8 áreas. | M |
| RF-09 | Crear tarjetas de problema con área, dolor, fórmula F1-F6, datos y origen [E]/[C]/[S], y calcular el coste mostrando la operación. | M |
| RF-10 | Aplicar las reglas de cálculo: × 4,3, redondeo hacia abajo, valor bajo de los rangos, hipótesis separadas y «sin datos» cuando falte un dato imprescindible. | M |
| RF-11 | Registrar el inventario de datos con semáforo. | S |
| RF-12 | Fijar el punto B: objetivo general, nivel objetivo e importancia por área, valor objetivo por indicador. | M |
| RF-13 | Calcular brechas y clasificar fortalezas, debilidades y urgencias. | M |
| RF-14 | Dibujar el gráfico de radar con A, B e ideal, marcando las áreas no exploradas como tales. | M |
| RF-15 | Proponer los cruces de 6.4 y guardar los que el consultor confirme, con sus dos evidencias. | S |
| RF-16 | Colocar las tarjetas en la matriz dolor × euros con el umbral ajustable. | M |
| RF-17 | Proponer el orden de prioridad con la regla de 7.1, explicar cada posición y permitir moverla pidiendo un motivo. | M |
| RF-18 | Generar el DAFO y la sección «lo que no conviene tocar todavía». | S |
| RF-19 | Asignar destino y patrón a cada problema abordado y generar su ficha de tratamiento. | M |
| RF-20 | Descargar el kit del arnés (completo o ligero) con todos los archivos de 7.5 rellenados y los [PENDIENTE] marcados. | M |
| RF-21 | Generar el informe de una página y el informe completo, imprimibles a PDF desde el navegador. | M |
| RF-22 | Exportar e importar un caso completo como archivo. | M |
| RF-23 | Repetir la exploración en una revisión y mostrar A inicial, A actual y B. | C |
| RF-24 | Guiar cada paso con una explicación breve en tres líneas («Qué hacemos aquí», «Por qué importa», «Cómo se hace»), un ejemplo resuelto (Hidrotex u otro del catálogo) y un aviso de qué falta para poder seguir. Las ayudas se pueden ocultar. | M |
| RF-25 | Explicar con una frase sencilla cada resultado: por qué un área es fortaleza o debilidad, por qué un problema va en ese cuadrante de la matriz y por qué ocupa ese puesto en el orden. | M |
| RF-26 | Ofrecer un glosario emergente para los términos que aparecen (brecha, indicador, hipótesis, arnés…), sin jerga en lo que ve el empresario. | S |

M = imprescindible · S = debería · C = podría (MoSCoW).

## R8 · Requisitos no funcionales

| Id | Tipo | Requisito |
|---|---|---|
| RNF-01 | Privacidad | Ningún dato sale del dispositivo. Sin servidor, sin cuentas, sin llamadas a servicios externos. |
| RNF-02 | Entorno | Funciona en el navegador del móvil, la tableta y el portátil, también sin conexión. |
| RNF-03 | IA | Sin IA dentro. La IA entra después, en OpenCode, leyendo el caso exportado o el kit. |
| RNF-04 | Formato | El caso se guarda en un formato abierto y versionado (JSON con número de versión del método). |
| RNF-05 | Idioma | Todo en español llano; sin jerga técnica en lo que ve el empresario. |
| RNF-06 | Extensibilidad | Áreas, descriptores, motivos, fórmulas y patrones viven en archivos de contenido separados del código, para que el método crezca sin reprogramar. |
| RNF-07 | Accesibilidad | Contraste suficiente, uso con teclado y textos que no dependan solo del color. |
| RNF-09 | Facilidad de uso | Una persona sin formación previa completa la autoevaluación sin ayuda externa y el consultor novel puede seguir el recorrido entero guiado por la herramienta. Frases cortas, una idea por pantalla, ningún término técnico sin explicar. |
| RNF-08 | Rendimiento | Abre y guarda un caso en menos de 1 segundo en un móvil normal. |

## R11 · Criterios de aceptación

| Id | Dado… | Cuando… | Entonces… |
|---|---|---|---|
| CA-01 | una tarea de 3 h/semana [E] sin coste por hora declarado | se calcula F1 | se muestra «154 h/año» (3 × 4,3 × 12 = 154,8, redondeado hacia abajo) con la operación y sin euros |
| CA-02 | un rango declarado de «3 o 4 roturas al año» | se usa en una fórmula | se toma 3 y se indica |
| CA-03 | una tarjeta con dolor 5 y coste de 200 €/año, con umbral de 5.000 € | se coloca en la matriz | queda en «duele mucho, cuesta poco» con el mensaje «se explica con cifras» |
| CA-04 | una tarjeta con dolor 2 y coste de 12.000 €/año | se coloca en la matriz | queda en «lo que no ves y te está costando» |
| CA-05 | una urgencia «sin copias de seguridad» de coste sin datos | se calcula el orden | aparece en el escalón 1, antes que cualquier tarjeta con euros |
| CA-06 | una tarjeta de previsión de demanda y otra de revisión de datos, con datos no fiables | se calcula el orden | la revisión va antes, con el motivo «base para la previsión» |
| CA-07 | un área no explorada | se dibuja el radar | aparece como «no explorada», no como nivel 0 |
| CA-08 | el consultor mueve una tarjeta de puesto | guarda el cambio | la herramienta exige una frase de motivo y la muestra en el informe |
| CA-09 | un problema con destino «OpenCode construye» y patrón P2 | se descarga el kit | contiene todos los archivos de 7.5 y cada dato desconocido aparece como [PENDIENTE: …] |
| CA-10 | un caso exportado | se importa en otro dispositivo | se recupera idéntico |
| CA-12 | una persona que abre la herramienta por primera vez | entra en cualquier paso | ve qué se hace, por qué importa, cómo se hace y un ejemplo, y puede ocultar la ayuda |
| CA-13 | un problema colocado en «se explica con cifras» | se muestra el resultado | aparece una frase sencilla del tipo «Te molesta mucho, pero cuesta unos 300 € al año; hay otros problemas que te cuestan bastante más» |
| CA-11 | un texto importado con un listado de clientes con teléfonos | se importa | la herramienta avisa y no lo incorpora hasta que se quite |

## R12 · Tabla de ejemplos y umbral

| N.º | Entrada | Salida esperada |
|---|---|---|
| 1 | Caso Hidrotex del Anexo A | Mismas áreas, mismos costes y mismo orden que el Anexo A |
| 2 | 30 consultas/día × 5 min, 5 días/semana | 53 h/mes · 645 h/año (se redondea al final: 2,5 × 5 × 4,3 × 12 = 645) |
| 3 | Ventas perdidas 30.000-40.000 € [E], margen no declarado | «30.000 € de ventas perdidas [E]; el coste real es el margen sobre esa cifra [PENDIENTE: margen]» |
| 4 | Papel higiénico: dolor 5, 300 €/año [E] | Cuadrante «se explica con cifras» |
| 5 | Climatización de nave de 3.000 m²: dolor 1, gasto 40.000 €/año [E], reducción 15 % [S] | Cuadrante «lo que no ves y te está costando»; ahorro de 6.000 €/año marcado como hipótesis y fuera del titular |
| 6 | Motivo MC4 con la persona clave jubilándose dentro de 8 meses | Urgencia «dependencia de una persona con fecha» |
| 7 | Formulario vacío | Se ofrece el modo entrevista; nada se rellena solo |

**Umbral:** los 7 ejemplos deben dar exactamente la salida esperada. Si uno falla, no se publica la versión.

## R13 · Riesgos

| Riesgo | Qué hacemos |
|---|---|
| Falsa precisión: números que parecen exactos | Operación visible, rangos bajos, hipótesis separadas y categorías de viabilidad en lugar de fórmulas con decimales |
| El consultor acepta el orden sin pensar | El orden se presenta como propuesta y cada cambio pide motivo; el informe dice que es una recomendación |
| Pérdida o robo del dispositivo con casos de empresas | Solo datos agregados, nunca de clientes; exportación para copia; [PENDIENTE: decidir si se cifra el almacenamiento local] |
| Descriptores mal calibrados para algún sector | El contenido está separado del código y se revisa con cada caso real |
| Usar la herramienta para evaluar a personas | Fuera de alcance: se diagnostican procesos, no empleados (riesgo alto en el Reglamento europeo de IA) |

## R14 · Preguntas abiertas

1. Nombre definitivo de la herramienta.
2. ¿Se cifra el almacenamiento local de los casos?
3. Revisión de los descriptores de las 8 áreas por Fran, con su experiencia de empresa.
4. Umbral por defecto de la matriz dolor × euros: ¿1 % de la facturación o un valor fijo por tamaño de empresa?
5. Qué se recorta para la versión del alumnado y qué ayudas se añaden (ejemplo de Hidrotex en cada paso).
6. Estimación de inversión por patrón: ¿rangos orientativos en el catálogo o siempre a mano?

---

# ANEXO A · HIDROTEX POR EL MÉTODO

Caso ficticio del curso. Los datos marcados [E] salen del correo y de las respuestas de Ramón; los marcados [S] son supuestos para completar el ejemplo (en una visita real se preguntarían).

## A.1 Motivo de consulta

- **M3 · Objetivo en palabras:** «Decidme qué datos tengo y si están en condiciones» [E], y no volver a quedarse sin aire acondicionado en temporada [E, de sus respuestas].
- **Motivos del catálogo:** MC5 «No sé si mis datos sirven» + MC2 «Pierdo dinero en compras o stock».
- **5 porqués (compras):** se queda sin splits en junio → pide en abril a ojo → no mira las ventas porque sacarlas por meses es un lío → los datos están en el programa, pero salen con errores → **la causa de fondo está en los datos y en cómo se decide la compra**, no en el proveedor.
- **Restricciones:** 200 €/mes y el programa de gestión no se toca [E]; nadie programa en la empresa [E].

## A.2 Exploración (punto A) y punto B

| Área | A (consultor) | Evidencia | B acordado [S] | Importancia [S] |
|---|---|---|---|---|
| A3 · Operaciones, compras y stock | 2 | Pide en abril «a ojo»; el stock de la nave 2 va en un Excel aparte [E] | 4 | Alta |
| A6 · Datos y medición | 2 | Programa desde 2009, pero sacar ventas por meses «es un lío»; exportación cortada, precios retocados, referencias repetidas [E] | 4 | Alta |
| A2 · Ventas y atención | 2 | Consultas técnicas que solo resuelven 2 de 5; pedidos por WhatsApp en el móvil de la tienda [E] | 3 | Alta |
| A5 · Personas y conocimiento | 1 | Antonio no mira las fichas, «se lo sabe»; 400 fichas sin saber cuáles valen [E] | 3 | Alta |
| A1 · Clientes y marketing | 2 | Hoja de clientes desde 2008 con repetidos; se enteran tarde de quién deja de comprar [E] | 3 | Media |
| A8 · Uso actual de IA | 1 | Solo una oferta de un vendedor, sin probar [E] | 2 | Baja |
| A7 · Seguridad y protección de datos | Sin datos | No se sabe nada de copias; datos personales de clientes en el móvil de la tienda [E] | [PENDIENTE] | Alta |
| A4 · Cobro y finanzas | No explorada | — | — | — |

Brechas: A5 (2), A3 (2), A6 (2), A2 (1, importancia alta), A1 (1), A8 (1). **Debilidades:** A3, A6, A5, A2. **Fortalezas:** ninguna área en su objetivo; el consultor anota un programa único desde 2009 con dos años exportables y una cartera estable de unos 90 profesionales [E].

## A.3 Tarjetas de problema

| Tarjeta | Área | Dolor [S] | Coste (operación) | Datos | Patrón |
|---|---|---|---|---|---|
| T1 · Los datos no son fiables | A6 | 2 | Sin coste propio; es **base** de T2 y T3 | Ventas sep 2024-ago 2026 con 5 pistas de error [E] | P1 |
| T2 · Roturas de stock de splits en temporada | A3 | 5 | **30.000 € de ventas perdidas** en junio de 2025 [E, valor bajo del rango]; el coste real es el margen [PENDIENTE: margen]. Descuento del 5 % antes del 15 de marzo: [PENDIENTE: importe de la compra] | Dos años de ventas [E] | P2 |
| T3 · Calderas paradas | A3 | 3 | 14 calderas [E] × [PENDIENTE: coste por unidad]: sin datos en euros | Stock en el programa + Excel nave 2 [E] | P2 |
| T4 · Colas en el mostrador | A2, A5 | 4 | 30 consultas técnicas/día [E] × 5 min [E, valor bajo] = 2,5 h/día × 5 días [S] × 4,3 = **53 h/mes de temporada**; sin €/hora declarado. Riesgo por la jubilación de Antonio en 2028 [E]: hipótesis, fuera del titular | 400 fichas PDF sin ordenar [E] | P3 |
| T5 · Pedidos de WhatsApp perdidos | A2, A7 | 3 | 1 pedido/semana [E, valor bajo] × 4,3 = 4 pedidos/mes × [PENDIENTE: importe medio]: sin datos en euros | Ninguno: los pedidos no se registran [E] | Sin agente |
| T6 · Clientes que dejan de comprar | A1 | 2 | Sin cifra [E] | Hoja con repetidos + ventas [E] | P6 |

## A.4 Cruces confirmados

- **Lo dicho frente al dato:** Ramón cree que los datos están bien [E] · Rosa cuenta un corte de exportación, otro ordenador, precios retocados, fichas borradas y una referencia repetida [E].
- **El imprescindible:** «Antonio se lo sabe» [E] · solo 2 de 5 resuelven lo técnico y uno se jubila en 2028 [E].
- **Dolor frente a euros:** el mostrador es lo más visible del día a día · la única pérdida en euros declarada está en las compras.

## A.5 Matriz dolor × euros

Solo T2 tiene coste en euros; el consultor fija el umbral a mano en 5.000 €/año.

| | Cuesta mucho | Cuesta poco o sin datos |
|---|---|---|
| **Duele mucho** | T2 | T4 (horas, sin euros) |
| **Duele poco** | — | T1 (base), T3, T5, T6 |

## A.6 Orden propuesto por la herramienta

| Orden | Tarjeta | Escalón | Por qué | Destino |
|---|---|---|---|---|
| 1 | T5 (parte de datos personales) | Estabilizar | Datos personales de clientes en un móvil sin control | No hace falta agente: normas mínimas del móvil de la tienda y registrar cada pedido en el programa. Además es el primer quick win |
| 2 | T1 · Revisor de datos | Bases | Sin datos fiables no hay previsión | OpenCode construye (P1) |
| 3 | T2 + T3 · Previsor de compras | Retorno | La única pérdida en euros declarada; viable cuando T1 esté hecho | OpenCode construye (P2) |
| 4 | T4 · Asistente del mostrador | Retorno (viabilidad parcial) | Hay que ordenar antes las 400 fichas | OpenCode construye (P3), después de ordenar |
| 5 | T6 · Aviso de clientes | Retorno (sin euros) | Ampliación cuando los datos estén limpios | OpenCode construye (P6) |

La regla automática pone T6 antes que T4, porque T6 es viable y T4 tiene viabilidad parcial. El consultor sube T4 y deja escrito el motivo: «tiene 645 h/año medidas y una jubilación con fecha; el aviso de clientes no tiene ninguna cifra». Es el ejemplo de ajuste manual con motivo (RF-17).

**Lo que no conviene tocar todavía:** evaluar con IA a los empleados del mostrador (alto riesgo en el Reglamento europeo); pasar los WhatsApp a una IA (datos personales); montar el asistente del mostrador antes de ordenar las fichas.

## A.7 Kit para T1 (revisor de datos, patrón P1)

| Archivo | Contenido en este caso |
|---|---|
| `AGENTS.md` | Hidrotex, distribuidor de fontanería y climatización; objetivo: revisar las ventas exportadas y decir qué está mal y cómo arreglarlo; no se toca el programa de gestión; solo datos ficticios en servicios de IA; Python con pandas; comandos `/plan`, `/verificar`, `/cerrar` |
| `docs/cliente.md` | M1-M9 de Ramón, Canvas, motivos MC5 + MC2 y los 5 porqués |
| `docs/diagnostico.md` | Tablas A.2 a A.6 |
| `docs/requisitos.md` | R1-R14 del revisor (el documento ya resuelto en «Hidrotex resuelto»), con R14: margen, importe de compra y si el split nuevo se vende igual |
| `specs/aceptacion.md` | CA de duplicados, fechas en otro formato, precios mal escritos, clientes inexistentes y fichero vacío |
| `specs/ejemplos.md` | Tabla de 6 errores sembrados; umbral: los detecta todos |
| `progress/actual.md` | «Tarea 1: leer el fichero de ventas y contar filas y columnas» |
| `.agents/skills/revision-datos/SKILL.md` | Skill del patrón P1 |
| `tests/README.md`, `init.sh`, `datos/LEEME.md` | Esqueleto de tests, comprobación de entorno y formato esperado del CSV |

Este resultado coincide con el diagnóstico de «Hidrotex resuelto» (UD3): primero los datos, después las compras, el mostrador más adelante, WhatsApp a registrar y clientes como ampliación. Es la prueba de que el método reproduce lo que hicimos a mano.
