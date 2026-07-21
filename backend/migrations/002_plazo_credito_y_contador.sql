-- Agrega el campo plazo_credito a facturas (faltaba, tipo_cambio ya existía)
ALTER TABLE facturas ADD COLUMN IF NOT EXISTS plazo_credito INTEGER;

-- Tabla de contador de consecutivos con bloqueo de fila, para evitar
-- que dos facturas se creen con el mismo número si llegan casi al
-- mismo tiempo (race condition del COUNT() actual).
CREATE TABLE IF NOT EXISTS contadores_consecutivo (
  tipo_documento VARCHAR(2) PRIMARY KEY,
  numero INTEGER NOT NULL DEFAULT 0
);

INSERT INTO contadores_consecutivo (tipo_documento, numero)
VALUES ('01', 0), ('02', 0), ('03', 0), ('04', 0), ('09', 0)
ON CONFLICT (tipo_documento) DO NOTHING;