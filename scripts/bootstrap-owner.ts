import { loadEnvConfig } from '@next/env';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '../src/lib/supabase/admin';
import { classifyOwnerBootstrap, type OwnerProfile } from '../src/lib/auth/owner-bootstrap';

loadEnvConfig(process.cwd());

type Args = { firstName?: string; lastName?: string; zilisId?: string; email?: string };

function parseArgs(): Args {
  const args: Args = {};
  for (let index = 2; index < process.argv.length; index += 1) {
    const value = process.argv[index + 1];
    if (process.argv[index] === '--first-name') args.firstName = value;
    if (process.argv[index] === '--last-name') args.lastName = value;
    if (process.argv[index] === '--zilis-id') args.zilisId = value;
    if (process.argv[index] === '--email') args.email = value;
  }
  return args;
}

function readSecret(label: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('La contraseña debe introducirse desde una terminal interactiva.');
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let value = '';
    process.stdout.write(label);
    stdin.setRawMode?.(true);
    stdin.resume();
    const onData = (chunk: Buffer) => {
      const key = chunk.toString('utf8');
      if (key === '\u0003') { cleanup(); reject(new Error('Cancelado.')); return; }
      if (key === '\r' || key === '\n') { cleanup(); process.stdout.write('\n'); resolve(value); return; }
      if (key === '\u007f') { value = value.slice(0, -1); return; }
      value += key;
    };
    const cleanup = () => { stdin.setRawMode?.(false); stdin.pause(); stdin.off('data', onData); };
    stdin.on('data', onData);
  });
}

async function findAuthUserByEmail(admin: ReturnType<typeof createAdminClient>, email: string): Promise<User | null> {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`No se pudo consultar Supabase Auth: ${error.message}`);
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) return null;
  }
  throw new Error('No se pudo completar la búsqueda en Supabase Auth.');
}

const profileFields = 'id,email,zilis_id,experience_type,platform_role,created_by_user_id,sponsor_id,advisor_id,first_name,last_name';

async function main() {
  const { firstName, lastName, zilisId, email } = parseArgs();
  if (!firstName || !lastName || !zilisId) throw new Error('Uso: npm run bootstrap:owner -- --first-name "..." --last-name "..." --zilis-id "..." [--email "..."]');
  const normalizedEmail = email?.trim().toLowerCase() || `owner-${zilisId.toLowerCase().replace(/[^a-z0-9]/g, '')}@access.elitefocus.internal`;
  const admin = createAdminClient();
  const authUser = await findAuthUserByEmail(admin, normalizedEmail);
  const { data: targetProfile, error: targetError } = await admin.from('profiles').select(profileFields).eq('zilis_id', zilisId).maybeSingle();
  if (targetError) throw new Error(`No se pudo verificar el ID Zilis: ${targetError.message}`);
  const { data: authProfile, error: profileError } = authUser ? await admin.from('profiles').select(profileFields).eq('id', authUser.id).maybeSingle() : { data: null, error: null };
  if (profileError) throw new Error(`No se pudo consultar el profile: ${profileError.message}`);

  const action = classifyOwnerBootstrap({ authUserId: authUser?.id ?? null, authProfile: authProfile as OwnerProfile | null, targetProfileId: targetProfile?.id ?? null, targetZilisId: zilisId });
  if (action === 'conflict-email-profile') throw new Error(`Conflicto: el Auth user ${authUser?.id} tiene otro zilis_id (${authProfile?.zilis_id}). No se modificó nada.`);
  if (action === 'conflict-zilis') throw new Error(`Conflicto: el ID Zilis ${zilisId} pertenece a otro Auth user (${targetProfile?.id}). No se modificó nada.`);
  if (action === 'idempotent') { console.log('OWNER ya existe y está correctamente configurado.'); return; }

  const password = await readSecret('Contraseña inicial (no se mostrará): ');
  if (password.length < 10) throw new Error('La contraseña debe tener al menos 10 caracteres.');

  let userId = authUser?.id;
  if (!authUser) {
    const { data, error } = await admin.auth.admin.createUser({ email: normalizedEmail, password, email_confirm: true, user_metadata: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } });
    if (error || !data.user) throw new Error(`No se pudo crear el Auth user: ${error?.message ?? 'respuesta inválida'}`);
    userId = data.user.id;
  }

  const profile = { id: userId, email: authUser?.email ?? normalizedEmail, username: zilisId, zilis_id: zilisId, first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, experience_type: 'AMBASSADOR', platform_role: 'OWNER', must_change_password: false, onboarding_completed: true, onboarding_complete: true, onboarding_data: { source: 'owner_bootstrap' }, created_by_user_id: null, sponsor_id: null, advisor_id: null, current_stage: 'ORIENTATION' };
  const { error: saveProfileError } = await admin.from('profiles').upsert(profile, { onConflict: 'id' });
  if (saveProfileError) {
    if (!authUser && userId) await admin.auth.admin.deleteUser(userId);
    throw new Error(`No se pudo guardar el profile${!authUser ? '; el Auth user nuevo fue revertido' : ''}: ${saveProfileError.message}`);
  }
  if (!userId) throw new Error('No se pudo determinar el Auth user final.');

  const { error: roleCleanupError } = await admin.from('user_roles').delete().eq('user_id', userId);
  if (roleCleanupError) throw new Error(`Profile configurado, pero no se pudo ajustar el rol legado: ${roleCleanupError.message}`);
  const { error: roleError } = await admin.from('user_roles').insert({ user_id: userId, role: 'ambassador' });
  if (roleError) throw new Error(`Profile configurado, pero no se pudo ajustar el rol legado: ${roleError.message}`);
  const { error: passwordError } = await admin.auth.admin.updateUserById(userId, { password, email_confirm: true, user_metadata: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } });
  if (passwordError) throw new Error(`OWNER configurado, pero no se pudo establecer la contraseña inicial: ${passwordError.message}`);
  console.log(`OWNER creado/promovido correctamente. Usuario / ID Zilis: ${zilisId}. Login: /login`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : 'Bootstrap fallido.'); process.exitCode = 1; });
