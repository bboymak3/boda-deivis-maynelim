/**
 * /api/admin/confirmaciones — panel de confirmaciones (todo protegido con clave).
 *
 *   GET     lista todas las confirmaciones
 *   POST    agrega una confirmación a mano   { nombre, telefono?, asistencia }
 *   DELETE  borra una confirmación           ?id=123
 *
 * La clave se envía como  Authorization: Bearer <clave>  y se compara con el
 * secreto ADMIN_PASSWORD (no está en el código).
 *
 * Requiere en Cloudflare Pages → Settings:
 *   Bindings:   D1 database  generico_db  →  GENERICO_DB
 *   Variables:  ADMIN_PASSWORD  (tipo "Secret")
 */

const MAX_BODY = 2048;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
}

// Comparación en tiempo constante (no revela cuántos caracteres coinciden)
async function sameSecret(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

// Devuelve una respuesta de error si no está configurado o la clave no es válida;
// null si todo está bien.
async function checkAccess(request, env) {
  if (!env.ADMIN_PASSWORD || !env.GENERICO_DB) {
    return json({ ok: false, error: 'panel-no-configurado' }, 503);
  }
  const auth = request.headers.get('Authorization') || '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!given || !(await sameSecret(given, env.ADMIN_PASSWORD))) {
    await new Promise((r) => setTimeout(r, 800)); // frena los intentos de adivinar la clave
    return json({ ok: false, error: 'clave-incorrecta' }, 401);
  }
  return null;
}

export async function onRequestGet({ request, env }) {
  const denied = await checkAccess(request, env);
  if (denied) return denied;

  const { results } = await env.GENERICO_DB
    .prepare('SELECT id, nombre, telefono, asistencia, fecha, origen FROM boda_dm_confirmaciones ORDER BY fecha DESC, id DESC')
    .all();

  return json({ ok: true, items: results || [] });
}

export async function onRequestPost({ request, env }) {
  const denied = await checkAccess(request, env);
  if (denied) return denied;

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'demasiado-grande' }, 413);
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'json-invalido' }, 400);
  }

  const nombre = clean(input.nombre, 80);
  const telefono = clean(input.telefono, 30); // opcional cuando se agrega a mano
  const asistencia = input.asistencia === 'si' ? 'si' : input.asistencia === 'no' ? 'no' : '';
  if (nombre.length < 2 || !asistencia) {
    return json({ ok: false, error: 'datos-incompletos' }, 422);
  }

  const item = { nombre, telefono, asistencia, fecha: new Date().toISOString(), origen: 'manual' };
  const res = await env.GENERICO_DB
    .prepare('INSERT INTO boda_dm_confirmaciones (nombre, telefono, asistencia, fecha, origen) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(item.nombre, item.telefono, item.asistencia, item.fecha, item.origen)
    .run();

  return json({ ok: true, item: { id: res.meta?.last_row_id, ...item } }, 201);
}

export async function onRequestDelete({ request, env }) {
  const denied = await checkAccess(request, env);
  if (denied) return denied;

  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return json({ ok: false, error: 'id-invalido' }, 400);

  const res = await env.GENERICO_DB.prepare('DELETE FROM boda_dm_confirmaciones WHERE id = ?1').bind(id).run();
  if (!res.meta?.changes) return json({ ok: false, error: 'no-existe' }, 404);
  return json({ ok: true });
}

export async function onRequest() {
  return json({ ok: false, error: 'metodo-no-permitido' }, 405);
}
