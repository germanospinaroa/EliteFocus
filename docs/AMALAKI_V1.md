# Amalaki V1

La experiencia vive en `/app/catalogo/amalaki` y usa una sola base de contenido para Cliente VIP y Embajador. La capa Embajador se habilita por `profiles.experience_type`, mientras que `first_name` personaliza la bienvenida, el uso, Eli, el feedback y el cierre.

## Mercado

El selector usa `profiles.market` y, como compatibilidad, `profiles.country`. `CO`, `Colombia`, `US`, `USA` y `Estados Unidos` son reconocidos. Si ambos campos están vacíos, se muestra únicamente el contenido común: no se muestran nutrición, Vegan Friendly ni respuestas específicas de Colombia. La interfaz marca `Mercado por confirmar`; esto evita presentar un mercado como si aplicara automáticamente al otro sin crear una migración o una pantalla de fricción adicional.

## Progreso y Eli

El botón de uso registra `product_usage_opened` y `product_usage_completed` en `events`. Eli V1 usa respuestas estructuradas y FAQs, sin IA generativa ni API paga. El roleplay Amalaki tiene tres escenarios y reutiliza `/api/roleplay/complete` con `scenario: amalaki`. La selección de Persona vuelve a `/app/personas`, sin CRM paralelo.

## Contenido por mercado

- Colombia: uso, 1 sobre/240 ml/30 sobres, fibra 3 g, potasio 100 mg, 18 kcal, 0 g de grasa, ingredientes vegetales, Vegan Friendly y FAQs sustentadas disponibles en la fuente de V1.
- Estados Unidos: contenido común de uso y fórmula; no se muestran datos nutricionales ni sello Vegan Friendly porque no hay fuente aprobada en este repositorio para ese mercado.
- Pendientes no publicados como hechos: azúcar/edulcorantes para Colombia, nutrición y Vegan Friendly para Estados Unidos, precio, compra, testimonios, estudios, resultados esperados y combinaciones.
