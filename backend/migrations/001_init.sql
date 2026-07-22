-- Migración inicial. Alternativa a sequelize.sync(); recomendada para producción.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  rol VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_identificacion VARCHAR(2) NOT NULL DEFAULT '01',
  identificacion VARCHAR(20) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  nombre_comercial VARCHAR(100),
  email VARCHAR(160),
  telefono VARCHAR(20),
  provincia VARCHAR(1),
  canton VARCHAR(2),
  distrito VARCHAR(2),
  barrio VARCHAR(2),
  senas_extra VARCHAR(250),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_cabys VARCHAR(13) NOT NULL,
  codigo_interno VARCHAR(20),
  descripcion VARCHAR(200) NOT NULL,
  unidad_medida VARCHAR(10) NOT NULL DEFAULT 'Unid',
  precio_unitario NUMERIC(18,5) NOT NULL,
  porcentaje_iva NUMERIC(5,2) NOT NULL DEFAULT 13,
  es_exento BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_documento VARCHAR(2) NOT NULL DEFAULT '01',
  clave VARCHAR(50) NOT NULL UNIQUE,
  consecutivo VARCHAR(20) NOT NULL UNIQUE,
  fecha_emision TIMESTAMP NOT NULL,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  condicion_venta VARCHAR(2) DEFAULT '01',
  medio_pago VARCHAR(2) DEFAULT '01',
  moneda VARCHAR(3) DEFAULT 'CRC',
  tipo_cambio NUMERIC(18,5) DEFAULT 1,
  total_gravado NUMERIC(18,5),
  total_exento NUMERIC(18,5),
  total_venta NUMERIC(18,5),
  total_impuesto NUMERIC(18,5),
  total_comprobante NUMERIC(18,5),
  xml_firmado TEXT,
  estado_hacienda VARCHAR(20) DEFAULT 'pendiente',
  respuesta_hacienda TEXT,
  xml_respuesta_hacienda TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detalle_facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  numero_linea INTEGER NOT NULL,
  producto_id UUID NOT NULL REFERENCES productos(id),
  codigo_cabys VARCHAR(13),
  descripcion VARCHAR(200),
  cantidad NUMERIC(18,5) NOT NULL DEFAULT 1,
  unidad_medida VARCHAR(10),
  precio_unitario NUMERIC(18,5),
  monto_descuento NUMERIC(18,5) DEFAULT 0,
  subtotal NUMERIC(18,5),
  porcentaje_iva NUMERIC(5,2),
  monto_iva NUMERIC(18,5),
  monto_total_linea NUMERIC(18,5),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cabys_codigos (
  codigo VARCHAR(13) PRIMARY KEY,
  descripcion VARCHAR(300) NOT NULL,
  porcentaje_iva NUMERIC(5,2) NOT NULL DEFAULT 13,
  es_exento BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_cabys_descripcion ON cabys_codigos USING gin (to_tsvector('spanish', descripcion));
CREATE INDEX IF NOT EXISTS idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_detalle_factura ON detalle_facturas(factura_id);


ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS provincia_nombre VARCHAR(50),
  ADD COLUMN IF NOT EXISTS canton_nombre VARCHAR(50),
  ADD COLUMN IF NOT EXISTS distrito_nombre VARCHAR(50),
  ADD COLUMN IF NOT EXISTS barrio_nombre VARCHAR(50);


  CREATE TABLE IF NOT EXISTS empresa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  nombre_comercial VARCHAR(100),
  tipo_identificacion VARCHAR(2) NOT NULL DEFAULT '01',
  identificacion VARCHAR(20) NOT NULL,
  provincia VARCHAR(1),
  provincia_nombre VARCHAR(50),
  canton VARCHAR(2),
  canton_nombre VARCHAR(50),
  distrito VARCHAR(2),
  distrito_nombre VARCHAR(50),
  barrio VARCHAR(2),
  barrio_nombre VARCHAR(50),
  senas_extra VARCHAR(250),
  email VARCHAR(160) NOT NULL,
  email_copia VARCHAR(160),
  telefono VARCHAR(20),
  referencia VARCHAR(100),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);



ALTER TABLE productos
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresa(id);

ALTER TABLE facturas
  ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES empresa(id);

CREATE INDEX IF NOT EXISTS idx_productos_empresa ON productos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_facturas_empresa ON facturas(empresa_id);



-- La tabla actual tiene tipo_documento como PK único (global).
-- La recreamos con clave compuesta (empresa_id + tipo_documento).
DROP TABLE IF EXISTS contadores_consecutivo;

CREATE TABLE contadores_consecutivo (
  empresa_id UUID NOT NULL REFERENCES empresa(id),
  tipo_documento VARCHAR(2) NOT NULL,
  numero INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (empresa_id, tipo_documento)
);

-- Campos del emisor que antes vivían en variables de entorno (.env)
-- y ahora deben vivir por empresa.
ALTER TABLE empresa
  ADD COLUMN IF NOT EXISTS actividad_economica VARCHAR(10),
  ADD COLUMN IF NOT EXISTS sucursal VARCHAR(3) NOT NULL DEFAULT '001',
  ADD COLUMN IF NOT EXISTS terminal VARCHAR(5) NOT NULL DEFAULT '00001';