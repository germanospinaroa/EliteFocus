# Modelo de datos

El esquema inicial está en `supabase/schema.sql`. Las entidades se dividen en: identidad (`profiles`, `user_roles`, `consents`), conocimiento (`products`, versiones, claims, FAQs, fuentes, items), ejecución (`contacts`, `followups`, `catalog_links` y eventos), progresión (`journey_stages`, estado, milestones), asistencia (`roleplay_*`, `support_escalations`) y gobierno (`events`, `feature_flags`, `audit_logs`).

No se guardan conversaciones completas ni datos médicos sensibles por defecto. Versiones de producto/conocimiento deben poder auditarse y solo el contenido aprobado puede exponerse a clientes o utilizarse por Eli.
