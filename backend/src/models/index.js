const sequelize = require('../config/db');
const Cliente = require('./Cliente');
const Producto = require('./Producto');
const Factura = require('./Factura');
const DetalleFactura = require('./DetalleFactura');
const Usuario = require('./Usuario');
const CabysCodigo = require('./codigoCabys');

// Relaciones
Cliente.hasMany(Factura, { foreignKey: 'cliente_id' });
Factura.belongsTo(Cliente, { foreignKey: 'cliente_id' });

Factura.hasMany(DetalleFactura, { foreignKey: 'factura_id', as: 'detalles' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'factura_id' });

Producto.hasMany(DetalleFactura, { foreignKey: 'producto_id' });
DetalleFactura.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = {
  sequelize,
  Cliente,
  Producto,
  Factura,
  DetalleFactura,
  Usuario,
  CabysCodigo,
};