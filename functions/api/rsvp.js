/**
 * POST /api/rsvp — guarda una confirmación de asistencia.
 *
 * Lo llama la invitación (scripts/main.js) además de abrir WhatsApp.
 * Si el almacenamiento no está configurado responde 503 y la invitación
 * sigue funcionando igual.
 *
 * Requiere en Cloudflare Pages → Settings → Bindings:
 *   KV namespace con el nombre de variable  RSVP_KV
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
  if (!env.RSVP_KV) return json({ ok: false, error: 'almacenamiento-no-configurado' }, 503);

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

  const record = {
    nombre,
    telefono,
    asistencia,
    fecha: new Date().toISOString(),
  };

  // La clave empieza con la fecha para que la lista salga en orden.
  // Los datos van también en "metadata" para listarlos sin leer uno por uno.
  const key = `rsvp:${record.fecha}:${crypto.randomUUID().slice(0, 8)}`;
  await env.RSVP_KV.put(key, JSON.stringify(record), { metadata: record });

  return json({ ok: true }, 201);
}

export async function onRequest() {
  return json({ ok: false, error: 'metodo-no-permitido' }, 405);
}
