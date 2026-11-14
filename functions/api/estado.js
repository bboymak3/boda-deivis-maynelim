/**
 * GET /api/estado — diagnóstico del panel de confirmaciones.
 *
 * Abre https://<sitio>/api/estado en el navegador para ver si el servidor
 * tiene conectada la base de datos, si existe la tabla y si la clave del
 * panel está configurada. No muestra datos de invitados ni la clave.
 */

export async function onRequestGet({ env }) {
  const estado = {
    servidor: true,
    baseDeDatos: Boolean(env.GENERICO_DB),
    tabla: false,
    clave: Boolean(env.ADMIN_PASSWORD),
  };

  if (env.GENERICO_DB) {
    try {
      const row = await env.GENERICO_DB
        .prepare("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = 'boda_dm_confirmaciones'")
        .first();
      estado.tabla = Boolean(row);
    } catch (err) {
      estado.errorBaseDeDatos = String(err && err.message || err).slice(0, 200);
    }
  }

  estado.listo = estado.baseDeDatos && estado.tabla && estado.clave;
  return new Response(JSON.stringify(estado, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
