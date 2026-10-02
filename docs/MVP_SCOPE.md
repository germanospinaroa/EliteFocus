# MVP scope

Esta fase incluye autenticación invite-only, onboarding, Hoy, acceso de Clientes VIP y Embajadores, creación interna server-side de personas y cambio obligatorio de contraseña temporal. Knowledge Base, catálogo, productos, Eli completo y social selling no se amplían en esta fase.

Reglas de acceso: `AMBASSADOR → create CLIENT_VIP`, `AMBASSADOR → create AMBASSADOR`, `CLIENT_VIP → cannot create users`. OWNER y ADMIN son permisos internos de la experiencia AMBASSADOR.

La gestión administrativa vive dentro de `/app`: OWNER y ADMIN ven Administración; MEMBER no. OWNER puede administrar usuarios desde `/app/administracion/usuarios`, cambiar `platform_role` (`OWNER`, `ADMIN`, `MEMBER`), `experience_type` y las relaciones sponsor/advisor. El sistema conserva siempre al menos un OWNER y registra cambios en auditoría. Toda persona creada normalmente empieza como `MEMBER`. Mi equipo se deriva de relaciones directas reales; `leadership_enabled` no participa.

Fuera de alcance: CRM completo, universidad extensa, gamificación compleja, ranking, automatizaciones masivas, IA generativa, todos los productos/mercados.
