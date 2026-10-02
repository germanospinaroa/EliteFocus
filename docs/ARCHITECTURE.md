# Arquitectura

Elite Focus is invite-only. No existe registro público: los accesos se crean server-side por OWNER, ADMIN o AMBASSADOR autorizado mediante Supabase Admin. `SUPABASE_SERVICE_ROLE_KEY` solo vive en el entorno servidor.

Next.js App Router + TypeScript + React + Supabase SSR Auth/Postgres/RLS + Vercel. La sesión se refresca en `middleware.ts`; browser/server clients están en `src/lib/supabase`.

## Módulos
`src/modules/{auth,users,onboarding,journey,next-action,knowledge,products,catalog,catalog-links,content,training,contacts,followups,eli,progress,leadership,compliance,analytics,admin}`.

La UI vive en `src/app` y `src/components`; la lógica de dominio permanece en módulos sin depender de componentes visuales. Las mutaciones pasan por rutas API autenticadas y registran eventos/audit logs.

## Rutas
`/` y `/login` son públicas. `/registro` redirige a `/login`. Todas las rutas bajo `/app` heredan un único AppShell: Hoy, Eli, Catálogo, Aprender, Personas, Mi equipo, Progreso y Administración. `/app/personas` y `+ Agregar persona` solo aparecen para `AMBASSADOR`; `/app/mi-equipo` aparece automáticamente cuando existe una relación directa por `sponsor_id` o `advisor_id`.

El modelo separa experiencia de permisos: `experience_type` solo puede ser `CLIENT_VIP` o `AMBASSADOR`; `platform_role` puede ser `OWNER`, `ADMIN` o `MEMBER`. `leadership_enabled` queda como columna legacy deprecated y no participa en navegación ni autorización.

La ruta `POST /api/people` valida la sesión y la experiencia server-side, genera una contraseña temporal con `crypto`, crea el Auth user con Supabase Admin y guarda perfil, relación, tipo y `must_change_password=true`. Un `CLIENT_VIP` recibe 403.

El OWNER inicial se crea únicamente con `scripts/bootstrap-owner.ts`, ejecutado desde una terminal administrativa con `SUPABASE_SERVICE_ROLE_KEY`. El script es idempotente por ID Zilis, no imprime la contraseña ni secretos, y establece `AMBASSADOR + OWNER`. `/admin` usa `profiles.platform_role`; OWNER y ADMIN pueden entrar, MEMBER y CLIENT_VIP son redirigidos a `/app`.

La administración forma parte del shell autenticado: `/app/administracion`, `/app/administracion/usuarios`, `/app/administracion/usuarios/[id]` y `/app/administracion/activacion`. `/admin` se conserva solo como redirección legacy. OWNER y ADMIN pueden consultar administración; únicamente OWNER puede modificar datos, roles, experiencia y relaciones mediante `PATCH /api/admin/users/[id]`. Cada cambio genera un `audit_logs` y las migraciones `20261004_admin_management.sql` y `20261005_app_experience_cleanup.sql` protegen la operación y dejan `leadership_enabled` como legacy.

## Primer corte
La pantalla raíz usa fixtures para demostrar el flujo. El siguiente paso de implementación es conectar Supabase Auth, cargar `profiles/user_roles`, y reemplazar los fixtures por consultas server-side.
