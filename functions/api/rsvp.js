/**
 * POST /api/rsvp — guarda una confirmación de asistencia.
 *
 * Lo llama la invitación (scripts/main.js) además de abrir WhatsApp.
 * Si la base de datos no está configurada responde 503 y la invitación
 * sigue funcionando igual.
 *
 * Requiere en Cloudflare Pages → Settings → Bindings:
 *   D1 database  generico_db  con el nombre de variable  GENERICO_DB
 * Tabla: boda_dm_confirmaciones  (ver db/schema.sql)
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

export async function onRequestPost({ request, env }) {
  if (!env.GENERICO_DB) return json({ ok: false, error: 'base-de-datos-no-configurada' }, 503);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'demasiado-grande' }, 413);

  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: 'json-invalido' }, 400);
  }

  const nombre = clean(input.nombre, 80);
  const telefono = clean(input.telefono, 30);
  const asistencia = input.asistencia === 'si' ? 'si' : input.asistencia === 'no' ? 'no' : '';
  const digitos = telefono.replace(/\D/g, '');

  if (nombre.length < 3 || digitos.length < 7 || !asistencia) {
    return json({ ok: false, error: 'datos-incompletos' }, 422);
  }

  await env.GENERICO_DB
    .prepare('INSERT INTO boda_dm_confirmaciones (nombre, telefono, asistencia, fecha) VALUES (?1, ?2, ?3, ?4)')
    .bind(nombre, telefono, asistencia, new Date().toISOString())
    .run();

  return json({ ok: true }, 201);
}

export async function onRequest() {
  return json({ ok: false, error: 'metodo-no-permitido' }, 405);
}
