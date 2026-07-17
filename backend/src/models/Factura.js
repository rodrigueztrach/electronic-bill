const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tipos de documento según catálogo de Hacienda:
// 01 Factura Electrónica, 02 Nota Débito, 03 Nota Crédito,
// 04 Tiquete Electrónico, 08 FEC, 09 Factura de Compra, 10 FE Exportación
const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tipo_documento: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: '01',
  },
  clave: {
    // 50 dígitos, identificador único nacional del comprobante
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  consecutivo: {
    // 20 dígitos
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  fecha_emision: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  cliente_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  condicion_venta: {
    // 01 Contado, 02 Crédito, ...
    type: DataTypes.STRING(2),
    defaultValue: '01',
  },
  medio_pago: {
    // 01 Efectivo, 02 Tarjeta, 03 Cheque, 04 Transferencia, ...
    type: DataTypes.STRING(2),
    defaultValue: '01',
  },
  moneda: {
    type: DataTypes.STRING(3),
    defaultValue: 'CRC',
  },
  tipo_cambio: {
    type: DataTypes.DECIMAL(18, 5),
    defaultValue: 1,
  },
  total_gravado: DataTypes.DECIMAL(18, 5),
  total_exento: DataTypes.DECIMAL(18, 5),
  total_venta: DataTypes.DECIMAL(18, 5),
  total_impuesto: DataTypes.DECIMAL(18, 5),
  total_comprobante: DataTypes.DECIMAL(18, 5),
  xml_firmado: {
    type: DataTypes.TEXT,
  },
  estado_hacienda: {
    // recibido, procesando, aceptado, rechazado, error_envio
    type: DataTypes.STRING(20),
    defaultValue: 'pendiente',
  },
  respuesta_hacienda: DataTypes.TEXT,
  xml_respuesta_hacienda: DataTypes.TEXT,
}, {
  tableName: 'facturas',
});

module.exports = Factura;
