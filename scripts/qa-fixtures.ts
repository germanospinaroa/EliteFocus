import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

loadEnvConfig(process.cwd());

const QA_ENV_FILE = resolve(process.cwd(), '.env.qa.local');
const QA_DOMAIN = 'qa.elitefocus.invalid';

type FixtureKey = 'VIP_CO' | 'AMBASSADOR_CO' | 'VIP_US' | 'VIP_UNKNOWN';
type Fixture = {
  key: FixtureKey;
  firstName: string;
  lastName: 'QA';
  username: string;
  zilisId: string;
  email: string;
  experienceType: 'CLIENT_VIP' | 'AMBASSADOR';
  market: 'CO' | 'US' | null;
  country: 'CO' | 'US' | null;
};

const FIXTURES: Fixture[] = [
  { key: 'VIP_CO', firstName: 'Sofía', lastName: 'QA', username: 'QA-SOFIA-CO', zilisId: 'QA-SOFIA-CO', email: `sofia.co@${QA_DOMAIN}`, experienceType: 'CLIENT_VIP', market: 'CO', country: 'CO' },
  { key: 'AMBASSADOR_CO', firstName: 'Daniel', lastName: 'QA', username: 'QA-DANIEL-CO', zilisId: 'QA-DANIEL-CO', email: `daniel.co@${QA_DOMAIN}`, experienceType: 'AMBASSADOR', market: 'CO', country: 'CO' },
  { key: 'VIP_US', firstName: 'Emma', lastName: 'QA', username: 'QA-EMMA-US', zilisId: 'QA-EMMA-US', email: `emma.us@${QA_DOMAIN}`, experienceType: 'CLIENT_VIP', market: 'US', country: 'US' },
  { key: 'VIP_UNKNOWN', firstName: 'Alex', lastName: 'QA', username: 'QA-ALEX-UNKNOWN', zilisId: 'QA-ALEX-UNKNOWN', email: `alex.unknown@${QA_DOMAIN}`, experienceType: 'CLIENT_VIP', market: null, country: null },
];

const PEOPLE = [
  { firstName: 'Laura', lastName: 'Demo', username: 'QA-LAURA-DEMO', zilisId: 'QA-LAURA-DEMO', email: `laura.demo@${QA_DOMAIN}`, context: 'Conversación ficticia para practicar Amalaki y registrar un resultado.' },
  { firstName: 'Carlos', lastName: 'Demo', username: 'QA-CARLOS-DEMO', zilisId: 'QA-CARLOS-DEMO', email: `carlos.demo@${QA_DOMAIN}`, context: 'Conversación ficticia para probar un cierre respetuoso sin seguimiento.' },
];

function readQaEnv() {
  if (!existsSync(QA_ENV_FILE)) return;
  for (const line of readFileSync(QA_ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta ${name}. No se ejecuta ninguna operación QA sin credenciales server-side.`);
  return value;
}

function generateCredentials() {
  const values = Object.fromEntries(FIXTURES.map((fixture) => [`QA_${fixture.key}_PASSWORD`, randomBytes(32).toString('base64url')]));
  const content = `${Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n')}\n`;
  writeFileSync(QA_ENV_FILE, content, { encoding: 'utf8', mode: 0o600 });
  chmodSync(QA_ENV_FILE, 0o600);
  for (const [key, value] of Object.entries(values)) process.env[key] = value;
  console.log('Credenciales QA generadas en .env.qa.local (ignorado por git y no mostrado).');
}

function admin() {
  return createClient(required('NEXT_PUBLIC_SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } });
}

async function findAuthUser(client: SupabaseClient, email: string) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) break;
  }
  return null;
}

async function upsertAuthUser(client: SupabaseClient, email: string, password: string) {
  const existing = await findAuthUser(client, email);
  if (existing) {
    const { data, error } = await client.auth.admin.updateUserById(existing.id, { password, email_confirm: true, user_metadata: { qa_fixture: true } });
    if (error) throw error;
    return data.user;
  }
  const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { qa_fixture: true } });
  if (error) throw error;
  return data.user;
}

async function upsertProfile(client: SupabaseClient, id: string, fixture: Fixture) {
  const { error } = await client.from('profiles').upsert({
    id, email: fixture.email, full_name: `${fixture.firstName} ${fixture.lastName}`, first_name: fixture.firstName, last_name: fixture.lastName,
    username: fixture.username, zilis_id: fixture.zilisId, experience_type: fixture.experienceType, platform_role: 'MEMBER',
    leadership_enabled: false, market: fixture.market, country: fixture.country, onboarding_completed: true, onboarding_complete: true,
    must_change_password: false, current_stage: 'ORIENTATION', onboarding_data: { qa_fixture: true, qa_scenario: fixture.key },
  }, { onConflict: 'id' });
  if (error) throw error;
  await client.from('user_roles').delete().eq('user_id', id).in('role', ['admin', 'leader']);
  const role = fixture.experienceType === 'AMBASSADOR' ? 'ambassador' : 'customer';
  const { error: roleError } = await client.from('user_roles').upsert({ user_id: id, role }, { onConflict: 'user_id,role' });
  if (roleError) throw roleError;
}

async function setupPeople(client: SupabaseClient, ownerId: string) {
  for (const person of PEOPLE) {
    const password = randomBytes(32).toString('base64url');
    const authUser = await upsertAuthUser(client, person.email, password);
    if (!authUser) throw new Error(`No se pudo crear ${person.username}`);
    const { error } = await client.from('profiles').upsert({
      id: authUser.id, email: person.email, full_name: `${person.firstName} ${person.lastName}`, first_name: person.firstName, last_name: person.lastName,
      username: person.username, zilis_id: person.zilisId, experience_type: 'CLIENT_VIP', platform_role: 'MEMBER', leadership_enabled: false,
      onboarding_completed: false, onboarding_complete: false, must_change_password: true, advisor_id: ownerId,
      onboarding_data: { qa_fixture: true, qa_scenario: 'AMALAKI_DEMO', product_interest: 'AMALAKI', context: person.context }, current_stage: 'ORIENTATION',
    }, { onConflict: 'id' });
    if (error) throw error;
    await client.from('user_roles').delete().eq('user_id', authUser.id).in('role', ['admin', 'leader']);
  }
}

async function setup() {
  readQaEnv();
  if (process.argv.includes('--rotate') || FIXTURES.some((fixture) => !process.env[`QA_${fixture.key}_PASSWORD`])) {
    if (process.env.QA_GENERATE_CREDENTIALS !== '1') throw new Error('Faltan contraseñas QA. Ejecuta una vez con QA_GENERATE_CREDENTIALS=1 npm run qa:setup.');
    generateCredentials();
  }
  const client = admin();
  const ids: Record<string, string> = {};
  for (const fixture of FIXTURES) {
    const authUser = await upsertAuthUser(client, fixture.email, required(`QA_${fixture.key}_PASSWORD`));
    if (!authUser) throw new Error(`No se pudo crear ${fixture.username}`);
    await upsertProfile(client, authUser.id, fixture);
    ids[fixture.key] = authUser.id;
  }
  await setupPeople(client, ids.AMBASSADOR_CO);
  console.log(`Fixtures QA listas: ${FIXTURES.map((fixture) => `${fixture.username}=${ids[fixture.key]}`).join(', ')}`);
  console.log('Personas QA: QA-LAURA-DEMO y QA-CARLOS-DEMO. No se muestran contraseñas.');
}

async function fixtureIds(client: SupabaseClient) {
  const ids: string[] = [];
  for (const fixture of FIXTURES) {
    const user = await findAuthUser(client, fixture.email);
    if (user) ids.push(user.id);
  }
  return ids;
}

async function reset() {
  readQaEnv();
  const client = admin();
  const ids = await fixtureIds(client);
  if (!ids.length) throw new Error('No se encontraron fixtures QA. Ejecuta npm run qa:setup primero.');
  for (const table of ['followups', 'contacts']) {
    const { error } = await client.from(table).delete().in('owner_id', ids);
    if (error) throw error;
  }
  for (const [table, column] of [['events', 'user_id'], ['actions', 'user_id'], ['user_milestones', 'user_id'], ['consents', 'user_id'], ['user_journey_state', 'user_id'], ['catalog_links', 'owner_user_id']] as const) {
    const { error } = await client.from(table).delete().in(column, ids);
    if (error && !/does not exist|Could not find/i.test(error.message)) throw error;
  }
  const { error: resetProfilesError } = await client.from('profiles').update({ current_stage: 'ORIENTATION' }).in('id', ids);
  if (resetProfilesError) throw resetProfilesError;
  console.log(`Reset QA completado para ${ids.length} usuarios. Se conservaron usuarios y Personas QA.`);
}

async function status() {
  readQaEnv();
  const client = admin();
  for (const fixture of FIXTURES) {
    const user = await findAuthUser(client, fixture.email);
    if (!user) console.log(`${fixture.username}: ausente`);
    else {
      const { data: profile } = await client.from('profiles').select('id,first_name,experience_type,platform_role,market,onboarding_completed,must_change_password').eq('id', user.id).maybeSingle();
      console.log(`${fixture.username}: ${JSON.stringify(profile)}`);
    }
  }
}

async function main() {
  const command = process.argv[2] ?? 'status';
  if (command === 'setup') await setup();
  else if (command === 'reset') await reset();
  else if (command === 'status') await status();
  else throw new Error(`Comando desconocido: ${command}. Usa setup, reset o status.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
