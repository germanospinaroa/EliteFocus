# Catálogo y tracking

Elite Focus es la fuente de verdad para los links personalizados y su analítica. El catálogo público `catalogo-zilis.vercel.app` continúa siendo una experiencia pública independiente: no usa iframe ni comparte cookies con Elite Focus.

## Flujo

- Un CLIENT_VIP o AMBASSADOR crea un link en `/app/catalogo` o en la ficha de producto.
- Elite genera un token aleatorio y entrega `/v/[token]`.
- El redirect registra `LINK_OPENED` y envía al catálogo público con `?ref=token`.
- El catálogo guarda un `catalog_session_id` first-party durante 60 días y emite asíncronamente `SESSION_STARTED`, `CATALOG_VIEWED` y `PRODUCT_VIEWED` a `/api/catalog/events`.

No se guardan fingerprints ni IP como dato comercial. El label del destinatario es el texto que escribió la persona que comparte el link.

## Retención

Los eventos raw se conservan 60 días; las sesiones resumidas 12 meses; los agregados del link mientras exista la cuenta/link. `cleanup_catalog_tracking()` está preparada para ser llamada por un cron/función programada; el scheduling remoto queda pendiente hasta habilitarlo en Supabase.

La fuente de productos actual es una copia versionada controlada de `catalogozilis/data/products.ts`, limitada a ICE, AMALAKI, B-FIT, EDGE, RISE y ULTRA VIBE. `CATALOG_DATA_VERSION=2026-10-02` identifica esta sincronización. Para actualizarla: revisar primero los productos publicados del catálogo público, actualizar ambos archivos y el asset correspondiente, conservar solo productos aprobados, cambiar la versión y ejecutar build/tests en ambos proyectos. ACCELL permanece pendiente y no se muestra.

La sesión del catálogo público reutiliza el mismo `catalog_session_id` mientras exista en first-party storage y no expire su registro local de 60 días; después se crea una sesión nueva. Refrescar o navegar no crea otra sesión. `SESSION_STARTED` tiene deduplicación por `(catalog_link_id, session_id)`.

En `catalog_links.label` se guardan notas internas del propietario del enlace; `recipient_label` conserva la referencia visible del destinatario. La interfaz de creación no asocia Personas: el link se crea únicamente con destinatario y notas opcionales.
