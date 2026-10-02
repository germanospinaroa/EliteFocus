# Vertical slice real

## Flujo

El acceso es invite-only. `/registro` redirige a `/login`; no se usa `signUp` en la aplicación. `/login` recibe usuario o ID Zilis, resuelve internamente el email técnico y usa `signInWithPassword`. Las invitaciones se crean en `POST /api/people` con Supabase Admin, contraseña temporal y `must_change_password`. `middleware.ts` envía el primer ingreso a `/cambiar-clave` antes de `/onboarding` o `/app`.

El onboarding guarda rol, objetivo, experiencia, tiempo, canal, preferencia inicial, consentimiento de reglas y stage (`PRACTICE` para embajador; `ORIENTATION` para cliente). La migración reproducible es `supabase/migrations/20261001_activation_slice.sql`.

En `/app`, el servidor consulta perfil, roles, milestones, seguimientos vencidos y personas abiertas. `src/modules/next-action` decide una única acción determinística. El CTA registra `actions` y `next_action_started`. El roleplay de primera conversación registra la acción completada, `roleplay_completed`, `FIRST_PRACTICE` idempotente y mueve el stage a `FIRST_ACTION`; al volver a Hoy, el engine devuelve `TAKE_FIRST_ACTION`.

Personas y seguimientos usan APIs autenticadas y tablas existentes. Progreso se deriva de `user_milestones`. Admin muestra usuarios, onboarding, stages, último evento y milestones, condicionado a `admin` por middleware/RLS.

## Configuración necesaria

Aplicar primero `supabase/schema.sql` y luego la migration. Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en local y Vercel. La confirmación de email debe estar desactivada en el proyecto Supabase para un registro inmediato, o el usuario deberá confirmar el correo antes de iniciar sesión.
