const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Tabla local con el catálogo CABYS descargado del BCCR/Hacienda.
 * Se llena mediante el script scripts/importarCabys.js a partir de un CSV.
 */
const CabysCodigo = sequelize.define('CabysCodigo', {
  codigo: {
    type: DataTypes.STRING(13),
    primaryKey: true,
  },
  descripcion: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  porcentaje_iva: {
    // Tarifa de IVA que Hacienda asigna a este código (0, 1, 2, 4, 8, 13)
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 13,
  },
  es_exento: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'cabys_codigos',
  timestamps: false,
});

module.exports = CabysCodigo;