-- Migración (ya aplicada en remoto el 15-11-2026): distingue las confirmaciones
-- hechas desde la invitación ('web') de las agregadas a mano en el panel ('manual').
-- Las filas existentes quedan como 'web'.
ALTER TABLE boda_dm_confirmaciones ADD COLUMN origen TEXT NOT NULL DEFAULT 'web';
