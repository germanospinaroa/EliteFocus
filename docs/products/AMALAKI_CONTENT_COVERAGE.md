# Matriz de cobertura editorial — Amalaki V1.2

## Fuentes comprobadas

| Fuente | Disponible en el repositorio | Uso |
|---|---:|---|
| Inventario editorial incluido en el brief V1.2 | Sí, en la solicitud | Presentación, ingredientes, uso, nutrición CO/US, advertencias US, INVIMA CO y Vegan Friendly |
| `src/content/products/amalaki.ts` en `f0b7672` | Sí | Comparación contra la experiencia anterior y preservación de contratos |
| `public/catalog/amalaki-product.png` | Sí | Packshot común; no hay fotografía específica por mercado |
| Fichas completas/Flyers de Drive | No | No se finge lectura; claims promocionales quedan pendientes o excluidos |

## Cobertura por tema

| Tema | Antes | V1.2 | Estado / nota |
|---|---|---|---|
| Identidad | Descripción genérica | Amla, frutas y extractos vegetales en polvo | Incluido |
| Tres niveles | El nivel breve y el de 20 s se repetían; el completo hablaba de la plataforma | Frase, explicación de 20–30 s y explicación completa con datos nuevos | Incluido |
| Presentación | 30 sobres, sin peso completo | 30 × 7,2 g = 216 g | Inventario editorial; confirmar contra etiqueta primaria |
| Uso | 1 sobre, 240 ml, una vez al día | Mismo dato, separado en pasos accionables | Incluido |
| Ingredientes | 6 ingredientes con descripciones vagas | 9 ingredientes, identidad, razón de presencia y límite de evidencia | Uva/remolacha requieren etiqueta para cantidad/forma |
| Nutrición CO | Parcial | 18 kcal, carbohidratos, fibra, potasio, hierro, sodio, grasa/proteína | Inventario editorial; azúcar queda `REVIEW_REQUIRED` |
| Nutrición US | Ausente | 25 cal, carbohidratos, fibra, sodio, hierro, potasio | Inventario editorial; confirmar etiqueta |
| Edulcorantes | Pregunta sin respuesta | Sucralosa y alulosa visibles como pendientes de contraste | `REVIEW_REQUIRED`, no claim concluyente |
| Vegan Friendly | Solo CO | CO y US según inventario proporcionado | Confirmar sello por presentación |
| Regulación | INVIMA solo en contenido CO | INVIMA CO; ausencia explícita de registro US | No se inventa documento US |
| Precauciones | Genéricas | Advertencia US separada; no se transfiere automáticamente a CO | US disponible; CO requiere validación de texto final |
| FAQs | 4–6, repetitivas | 10 preguntas, respuestas por mercado | Incluido; algunas respuestas marcadas para revisión |
| Claims | “Fácil”, “ingredientes vegetales”, “información clara” | Características objetivas y fibra/composición; claims terapéuticos excluidos | Claims de flyers: `EXCLUDED` hasta revisión |
| Eli | Respuestas hard-coded, US incompleto | Respuestas derivadas del mercado seleccionado; limpia respuesta al cambiar | Incluido sin API nueva |
| Embajador | Guiones genéricos | Pitch, escucha, conexiones, límites y roleplay con mercado | Incluido |
| Personas / Follow-up | Enlace existente | Se conserva `AMALAKI → Persona → resultado → Follow-up` | Sin migración |

## Reglas de publicación

- `APPROVED_FOR_MARKET`: se muestra como dato de la presentación elegida.
- `REVIEW_REQUIRED`: se muestra únicamente como pendiente o advertencia; no se presenta como conclusión regulatoria.
- `EXCLUDED`: no se muestra como beneficio. Incluye enfoques de antioxidantes, digestión, inmunidad, vitalidad y bienestar cardiovascular hasta contar con revisión de sustento y cumplimiento.
- `UNKNOWN`: no muestra nutrición, regulación ni claims exclusivos de CO/US. El usuario debe elegir el mercado en el selector.

## Pendientes precisos

1. Contrastar etiqueta/ficha primaria de Colombia para azúcares totales frente a añadidos, sucralosa, alulosa, etiquetado frontal y cantidades completas.
2. Contrastar etiqueta/ficha primaria de Estados Unidos para ingredientes completos, Vegan Friendly, 216 g y advertencias textuales exactas.
3. Incorporar fotografías específicas por mercado si existen; actualmente solo hay un packshot común.
4. Revisar cualquier claim de flyer con compliance antes de habilitarlo en `claims`.
