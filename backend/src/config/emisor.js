// Datos fijos del emisor (tu empresa), tomados de variables de entorno.
require('dotenv').config();

module.exports = {
  tipoIdentificacion: process.env.EMISOR_CEDULA_TIPO || '02',
  cedula: process.env.EMISOR_CEDULA,
  nombre: process.env.EMISOR_NOMBRE,
  nombreComercial: process.env.EMISOR_NOMBRE_COMERCIAL,
  ubicacion: {
    provincia: process.env.EMISOR_PROVINCIA,
    canton: process.env.EMISOR_CANTON,
    distrito: process.env.EMISOR_DISTRITO,
    barrio: process.env.EMISOR_BARRIO,
    senasExtra: process.env.EMISOR_SENAS,
  },
  telefono: {
    codigoPais: process.env.EMISOR_TELEFONO_CODPAIS || '506',
    numero: process.env.EMISOR_TELEFONO,
  },
  email: process.env.EMISOR_EMAIL,
  actividadEconomica: process.env.EMISOR_ACTIVIDAD_ECONOMICA,
  sucursal: process.env.SUCURSAL || '001',
  terminal: process.env.TERMINAL || '00001',
};
