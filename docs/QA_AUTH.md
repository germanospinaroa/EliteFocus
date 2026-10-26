# QA autenticado local

El recorrido QA usa Supabase Auth real y perfiles reales, sin bypass de middleware ni cuentas reales. `scripts/qa-fixtures.ts` usa `SUPABASE_SERVICE_ROLE_KEY` únicamente desde el entorno local y nunca se importa desde una ruta web.

## Preparar fixtures

```bash
QA_GENERATE_CREDENTIALS=1 npm run qa:setup
npm run qa:status
```

La primera ejecución genera credenciales fuertes en `.env.qa.local`, archivo local ignorado por git con permisos `0600`. Las contraseñas no se imprimen. Las cuentas son `QA-SOFIA-CO`, `QA-DANIEL-CO`, `QA-EMMA-US` y `QA-ALEX-UNKNOWN`; todas tienen `platform_role=MEMBER`.

Para invalidar las credenciales locales y crear otras sin cambiar los usuarios: `QA_GENERATE_CREDENTIALS=1 npx tsx scripts/qa-fixtures.ts setup --rotate`.

## Repetir recorridos

```bash
npm run qa:reset
```

El reset elimina únicamente eventos, contactos, seguimientos y estados de recorrido asociados a los IDs QA. Conserva las cuentas y las dos Personas demo de Daniel.

Las Personas demo son `QA-LAURA-DEMO` y `QA-CARLOS-DEMO`, vinculadas a Daniel mediante `advisor_id` como corresponde a Personas `CLIENT_VIP`. No se envían emails, WhatsApp ni otras comunicaciones externas.
