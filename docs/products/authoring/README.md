# ELITE FOCUS — ENTREGA EDITORIAL CERRADA DE SIETE PRODUCTOS
Fecha editorial: 2026-11-02. Responsable de redacción y síntesis: ChatGPT a partir de archivos conectados del Drive Elite Focus (cuenta de Germán).
**Estos archivos son la única fuente de copy visible para esta implementación. Codex construye; no investiga, no redacta y no improvisa beneficios, preguntas, titulares, explicaciones, claims ni advertencias.**

## 1. Archivos definitivos

| Slug exacto | Producto | Archivo de copy | Imagen validada del repositorio | Estado del mercado Colombia |
|---|---|---|---|---|
| `b-fit` | B-FIT | `b-fit.json` | `/catalog/b-fit-product.png` | Ficha comercial sin etiqueta local primaria |
| `accell` | ACCELL | `accell.json` | **No hay packshot compatible** | Ficha comercial Berry Burst 140 g, etiqueta local pendiente |
| `rise` | RISE | `rise.json` | `/catalog/rise-product.png` | Material LATAM sin confirmación de versión/registros de CO |
| `ice` | Ultra ICE | `ice.json` | `/catalog/ice-product.png` | Sin ficha CO; información de suplemento estadounidense |
| `ultra-dream` | UltraDream | `ultra-dream.json` | Source: `/catalog/source/ultra-dream-60ml-infographic.jpg` | Sin ficha CO; fuente de frasco USA 60 mL |
| `edge` | UltraEdge Caribbean Crush | `edge.json` | `/catalog/edge-product.png` | Sin ficha CO; información de suplemento estadounidense |
| `ultra-vibe` | UltraVibe | `ultra-vibe.json` | `/catalog/ultra-vibe-product.png` | Sin ficha CO; información estadounidense de cáñamo/THC |

Todos los JSON están en `docs/products/authoring/`. La propiedad `sources[]` incluye IDs exactos de documentos de Drive ya leídos, `excluded[]` es texto interno NO PUBLICABLE y `publicationNote` es una regla de implementación NO VISIBLE. `editionStatus` tampoco debe aparecer al usuario.

## 2. Regla de mercados, no negociable

- El selector de **versión de producto comienza siempre en Colombia**, incluso si el perfil no tiene mercado. El usuario puede seleccionar Estados Unidos sin cambiar `profiles.country` ni `profiles.market`. Preservar `?market=US` en URL y enlaces de roleplay.
- **No crear una ficha estadounidense o colombiana a partir de datos del otro mercado.** Las propiedades de cada JSON describen exclusivamente la edición de referencia indicada por `edition`.
- Para `b-fit`, `accell` y `rise` mostrar la guía editorial descriptiva CO con este subtítulo visible exacto en un bloque discreto: **"Información de referencia. Revisa siempre la etiqueta vigente de la presentación que tienes."** No etiquetar esos datos como registro sanitario CO confirmado, ni decir "aprobado por INVIMA".
- Para `ice`, `ultra-dream`, `edge` y `ultra-vibe`: mientras se seleccione CO mostrar solo: **"Todavía no contamos con una ficha confirmada para Colombia."** Debajo: **"Puedes consultar la información de la presentación de Estados Unidos. Sus ingredientes e indicaciones pueden ser diferentes."** Botón exacto **"Ver presentación de Estados Unidos"**. NO exponer hero facts, dosis, nutrición, advertencias US o roleplay US bajo la etiqueta Colombia. Al pulsar el botón cambiar a US sin modificar el perfil.
- En US de `b-fit`, `accell`, `rise`: si no hay ficha US documentada mostrar la misma pantalla de indisponibilidad, cambiando "Colombia" por "Estados Unidos" y botón **"Volver a Colombia"**, SIN duplicar contenido CO.
- En US de `ice`, `ultra-dream`, `edge`, `ultra-vibe`: utilizar el contenido exacto del JSON. Mostrar el nombre del mercado en etiqueta y bloque informativo; NO afirmar que los productos tienen aprobación FDA.
- Para `ultra-vibe`, disponibilidad y ventas en Colombia quedan fuera de alcance y NO se habilitan enlaces de compra; es un suplemento de cáñamo con THC reportado en documentación US.

## 3. Texto visible: contrato de renderización

Usar EXACTAMENTE `name`, `hero`, `explanations`, `ingredients`, `features`, `nutrition` (si existe), `usage`, `precautions`, `faqs`, `eli` y `ambassador` de cada JSON. No corregir frases, parafrasear, traducir ni completar datos faltantes. La única sustitución de texto permitida es `{firstName}` por el nombre del perfil, con fallback cálido sin nombres falsos.

Para la vista de producto replicar el renderer aprobado de Amalaki con este orden visible:
1. Volver al catálogo, selector "Versión del producto", hero + packshot compatible.
2. Datos rápidos, si esa edición los tiene.
3. "Cómo se usa": los tres `usage.steps` y `usage.note`, con precauciones pertinentes.
4. "¿Qué es {producto}?": tres niveles de `explanations.one`, `quick`, `full`; progresivo y sin autorrepetición.
5. "Lo más importante": las tarjetas exactas `features`; luego `nutrition` si corresponde. No construir cuadrícula con celdas fantasma.
6. "¿Quieres conocerlo mejor?": `ingredients`, `precautions`, `faqs` dentro de disclosures cerrados por defecto.
7. Eli: `eli.intro`, los cuatro botones exactos `eli.prompts` y sus RESPUESTAS LITERALES en `eli.answers` (las siete fichas ya incluyen el mapa exacto pregunta → respuesta). No redactar respuestas, no hacer correspondencia difusa contra FAQs ni fingir IA conversacional libre. Si una pregunta no figura en `eli.answers`, respuesta única exacta: **"Todavía no tengo información confirmada para responder eso sobre esta presentación."**
8. Solo Embajador: `ambassador.intro`, cuatro acciones "Explícalo", "Escucha", "Evita", "Practica"; textos exactos `one`, `listen`, `avoid`, `roleplay`. El roleplay requiere escribir la propia respuesta y permite ver el ejemplo, NO proporciona calificación automática ni ofrece una única respuesta precargada como práctica.
9. "¿Con quién te gustaría compartir {producto}?": CTA exacto "Elegir una persona", conservar interés del producto y conectar el módulo Personas/Follow-ups existente.
10. Cierre por rol con acción real, SIN botones del tipo "Ya sé usarlo", "Completado", "Guardado", ni marcar aprendizaje por simple scroll.

UI: reutilizar layout, tipografía y paleta existentes; mobile-first; texto legible sin grandes paredes; accesibilidad y safe-area. Amalaki **no debe alterarse** salvo cambios reutilizables que no modifiquen sus contenidos.

## 4. Assets, cuidado con variantes

- `b-fit`, `rise`, `ice`, `edge` y `ultra-vibe`: validar que el packshot ya presente en `public/catalog` corresponde al producto indicado y utilizarlo si coincide; no reconstruir envases ni inventar imágenes.
- `ultra-dream`: contamos con un original de Drive **subido al repositorio** en `public/catalog/source/ultra-dream-60ml-infographic.jpg`; muestra claramente frasco de 60 mL. Recortar localmente SOLO la imagen del frasco (lado izquierdo) como asset de UI, conservando fidelidad del producto; nunca usar ese packshot de 60 mL para describir una variante de 30 mL.
- `accell`: la imagen Drive `Energía natural para tu día.png` **NO ES LA PRESENTACIÓN DE LA FICHA**: muestra 570 g sabor guaraná-piña-ginseng, mientras la ficha habla de 140 g Berry Burst. No utilizarla como packshot Berry Burst ni reciclar ingredientes o cifras de una variante en la otra. Si no hay packshot Berry Burst legítimo en el repo, hero tipográfico premium sin imagen de envase y registrar ese pendiente. NO pedirle al usuario que reenvíe materiales que ya existen.
- Nunca insertar una pieza publicitaria con claims que fueron excluidos como si fuera un beneficio validado en la interfaz.

## 5. Control editorial y seguridad

Los textos en JSON son **copy cerrado**; no significa que toda formulación tenga un etiquetado local validado. Preservar explícitamente `editionStatus`, `publicationNote`, `excluded` y `sources` como metadatos internos. NO mostrar texto interno, estados `PENDIENTE`, discrepancias editoriales ni mensajes de construcción al consumidor.

No publicar: tratamientos, promesas de resultados, disminución de dolor, curación, reducción garantizada de peso, dosis inferidas, porcentajes/registros no confirmados, o información de nutrición importada de otra versión. En B-FIT el testimonio “perdí 7 libras en 7 días” NO es claim publicable. En UltraDream: 50 mg es el TOTAL de la mezcla, no cantidad de melatonina. En UltraEdge: 130 mg es el TOTAL de la mezcla, no cafeína; cifra de sodio contradictoria no se muestra. En UltraVibe: se informa posible positivo en control de drogas; nunca prometer lo contrario.

## 6. Alcance técnico

- Actualmente `src/lib/catalog/products.ts` ya contiene: `ice`, `amalaki`, `b-fit`, `edge`, `rise`, `ultra-vibe`. Incorporar `accell` y `ultra-dream` al catálogo.
- Crear renderizador **realmente compartido** y datos por producto, basándose en la arquitectura Amalaki, con layout común y contenido por roles/mercados. No copiar 7 componentes JSX gigantes ni alterar autenticación. Si refactorizar Amalaki implica riesgo, conservarlo y compartir únicamente los componentes estables.
- Copiar el texto EXACTO desde los JSON, no dejar lógica de marketing como `sourcePrompt`, ni usar la descripción vieja genérica de `catalogProducts` al abrir la página.
- Integrar contexto de producto al seleccionar Persona: `product_interest` equivalente y validado, no crear CRM paralelo. Reutilizar analytics existentes.
- Reutilizar Eli estructurada, sin APIs de IA pagas. Preguntas y respuestas trazables al JSON.
- Todos los enlaces de compra, precio, testimonios, registros y recursos externos que no tengan destino oficial verificado deben omitirse.

## 7. QA / release

- Probar VIP Colombia, Embajador Colombia, y USA con fixtures reales. Probar TODOS los slugs y cambios CO↔US, incluidas las pantallas de edición no confirmada.
- Probar que las respuestas Eli y el roleplay respetan el país seleccionado, que los VIP no ven herramientas Embajador y que la vista CO no hereda datos US.
- Comprobar que no hay datos de edición cruzados (especialmente ACCELL Berry Burst vs guaraná-piña-ginseng; DREAM 30 vs 60 mL).
- Tests, typecheck, build, mobile 390 × 844, desktop, regresión de Amalaki, protección de rutas y accesibilidad.
- Commit, push a main, deployment a producción y comprobación post-deploy si las pruebas pasan. Si Codex no tiene token Vercel, que entregue SHA; el despliegue puede hacerse con la conexión autenticada de Vercel desde ChatGPT.
- La entrega reportará por producto: slug, mercados realmente sustentados, asset, QA, cualquier limitación documental. No entregar "listo" si páginas nuevas no aparecen realmente en catálogo.

**Regla final: el investigador/editor escribió todo el contenido visible en estos JSON. El implementador no tiene permiso para redactar, resumir, investigar, inferir ni rellenar nada.**
