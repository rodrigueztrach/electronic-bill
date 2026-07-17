const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  rol: {
    type: DataTypes.STRING(20),
    defaultValue: 'admin',
  },
}, {
  tableName: 'usuarios',
});

module.exports = Usuario;
