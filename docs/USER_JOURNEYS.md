# User journeys

## Embajador invitado
Recibe usuario/ID Zilis y contraseña temporal → primer ingreso en `/cambiar-clave` → onboarding breve → Hoy → práctica → primera acción.

Desde `+ Agregar persona`, un `AMBASSADOR` puede crear `CLIENT_VIP` o `AMBASSADOR`. La persona creada queda relacionada con `created_by_user_id`; un embajador creado recibe `sponsor_id` y un Cliente VIP recibe `advisor_id`.

Cuando existe al menos una relación directa por `sponsor_id` o `advisor_id`, aparece automáticamente `Mi equipo` dentro del AppShell. La vista resume personas, tipo de experiencia, etapa y señales de atención.

## Cliente VIP
Hoy de cliente con productos, uso, FAQs, contenido, catálogo, Eli y contacto con su embajador. La invitación al negocio es discreta y no muestra compensación, reclutamiento ni objetivos de equipo.

No puede crear usuarios ni ver Personas, Mi equipo, estructura o herramientas de patrocinio.

## OWNER / ADMIN
Entran por `/app` y ven Administración dentro del mismo shell. OWNER puede abrir Resumen, Usuarios y Activación, editar perfiles, cambiar experiencia, liderazgo, sponsor/advisor y roles con confirmación y auditoría. ADMIN puede consultar usuarios y activación, pero no modificar permisos ni cuentas OWNER. MEMBER no ve Gestión y los intentos directos reciben una redirección/403.
