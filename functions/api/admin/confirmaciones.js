/**
 * GET /api/admin/confirmaciones — lista todas las confirmaciones guardadas.
 *
 * Protegido con la clave del panel, enviada como  Authorization: Bearer <clave>.
 * La clave NO está en el código: se compara con el secreto ADMIN_PASSWORD.
 *
 * Requiere en Cloudflare Pages → Settings:
 *   Bindings:   D1 database  generico_db  →  GENERICO_DB  (el mismo que usa /api/rsvp)
 *   Variables:  ADMIN_PASSWORD  (tipo "Secret")
 */

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
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

export async function onRequestGet({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.GENERICO_DB) {
    return json({ ok: false, error: 'panel-no-configurado' }, 503);
  }

  const auth = request.headers.get('Authorization') || '';
  const given = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!given || !(await sameSecret(given, env.ADMIN_PASSWORD))) {
    await new Promise((r) => setTimeout(r, 800)); // frena los intentos de adivinar la clave
    return json({ ok: false, error: 'clave-incorrecta' }, 401);
  }

  const { results } = await env.GENERICO_DB
    .prepare('SELECT id, nombre, telefono, asistencia, fecha FROM boda_dm_confirmaciones ORDER BY fecha DESC, id DESC')
    .all();

  return json({ ok: true, items: results || [] });
}

export async function onRequest() {
  return json({ ok: false, error: 'metodo-no-permitido' }, 405);
}
