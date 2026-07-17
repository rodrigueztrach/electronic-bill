const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetalleFactura = sequelize.define('DetalleFactura', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  factura_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  numero_linea: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  producto_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  codigo_cabys: DataTypes.STRING(13),
  descripcion: DataTypes.STRING(200),
  cantidad: {
    type: DataTypes.DECIMAL(18, 5),
    allowNull: false,
    defaultValue: 1,
  },
  unidad_medida: DataTypes.STRING(10),
  precio_unitario: DataTypes.DECIMAL(18, 5),
  monto_descuento: {
    type: DataTypes.DECIMAL(18, 5),
    defaultValue: 0,
  },
  subtotal: DataTypes.DECIMAL(18, 5),
  porcentaje_iva: DataTypes.DECIMAL(5, 2),
  monto_iva: DataTypes.DECIMAL(18, 5),
  monto_total_linea: DataTypes.DECIMAL(18, 5),
}, {
  tableName: 'detalle_facturas',
});

module.exports = DetalleFactura;
