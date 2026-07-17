const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Tipos de identificación según Hacienda:
// 01 Física, 02 Jurídica, 03 DIMEX, 04 NITE, 05 Extranjero no domiciliado
const Cliente = sequelize.define('Cliente', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  tipo_identificacion: {
    type: DataTypes.STRING(2),
    allowNull: false,
    defaultValue: '01',
  },
  identificacion: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  nombre_comercial: DataTypes.STRING(100),
  email: DataTypes.STRING(160),
  telefono: DataTypes.STRING(20),
  provincia: DataTypes.STRING(1),
  canton: DataTypes.STRING(2),
  distrito: DataTypes.STRING(2),
  barrio: DataTypes.STRING(2),
  senas_extra: DataTypes.STRING(250),
}, {
  tableName: 'clientes',
});

module.exports = Cliente;
