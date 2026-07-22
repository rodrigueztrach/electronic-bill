const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  empresa_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  codigo_cabys: {
    type: DataTypes.STRING(13),
    allowNull: false,
  },
  codigo_interno: DataTypes.STRING(20),
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  unidad_medida: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'Unid',
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(18, 5),
    allowNull: false,
  },
  porcentaje_iva: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 13,
  },
  es_exento: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'productos',
});

module.exports = Producto;