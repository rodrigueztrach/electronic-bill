const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Empresa = sequelize.define('Empresa', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  nombre_comercial: DataTypes.STRING(100),
  tipo_identificacion: { type: DataTypes.STRING(2), allowNull: false, defaultValue: '01' },
  identificacion: { type: DataTypes.STRING(20), allowNull: false },
  provincia: DataTypes.STRING(1),
  provincia_nombre: DataTypes.STRING(50),
  canton: DataTypes.STRING(2),
  canton_nombre: DataTypes.STRING(50),
  distrito: DataTypes.STRING(2),
  distrito_nombre: DataTypes.STRING(50),
  barrio: DataTypes.STRING(2),
  barrio_nombre: DataTypes.STRING(50),
  senas_extra: DataTypes.STRING(250),
  email: { type: DataTypes.STRING(160), allowNull: false },
  email_copia: DataTypes.STRING(160),
  telefono: DataTypes.STRING(20),
  referencia: DataTypes.STRING(100),
  actividad_economica: DataTypes.STRING(10),
  sucursal: { type: DataTypes.STRING(3), allowNull: false, defaultValue: '001' },
  terminal: { type: DataTypes.STRING(5), allowNull: false, defaultValue: '00001' },
  usuario_id: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'empresa',
});

module.exports = Empresa;