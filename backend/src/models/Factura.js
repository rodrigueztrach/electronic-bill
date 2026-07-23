const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Factura = sequelize.define('Factura', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  tipo_documento: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: '01',
  },
  clave: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  consecutivo: {
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
    type: DataTypes.STRING(2),
    defaultValue: '01',
  },
  medio_pago: {
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
  plazo_credito: DataTypes.INTEGER,
  total_gravado: DataTypes.DECIMAL(18, 5),
  total_exento: DataTypes.DECIMAL(18, 5),
  total_venta: DataTypes.DECIMAL(18, 5),
  total_impuesto: DataTypes.DECIMAL(18, 5),
  total_comprobante: DataTypes.DECIMAL(18, 5),
  xml_firmado: {
    type: DataTypes.TEXT,
  },
  estado_hacienda: {
    type: DataTypes.STRING(20),
    defaultValue: 'pendiente',
  },
  respuesta_hacienda: DataTypes.TEXT,
  xml_respuesta_hacienda: DataTypes.TEXT,
}, {
  tableName: 'facturas',
});

module.exports = Factura;