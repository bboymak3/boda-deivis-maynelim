-- Confirmaciones de asistencia de la boda Deivis & Maynelim.
-- Vive en la base D1 compartida "generico_db"; el prefijo boda_dm_ la separa
-- de las tablas de otros proyectos. Solo crea, nunca borra ni modifica nada.
--
-- Aplicar:  wrangler d1 execute generico_db --remote --file=db/schema.sql

CREATE TABLE IF NOT EXISTS boda_dm_confirmaciones (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre      TEXT    NOT NULL,
  telefono    TEXT    NOT NULL,
  asistencia  TEXT    NOT NULL CHECK (asistencia IN ('si', 'no')),
  fecha       TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_boda_dm_confirmaciones_fecha ON boda_dm_confirmaciones (fecha);
