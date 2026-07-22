const { obtenerConfigEmisor } = require('../services/emisorService'); 

/**
 * Construye la configuración del emisor (equivalente al antiguo
 * config/emisor.js estático) a partir del registro de Empresa
 * correspondiente al usuario autenticado. Cada empresa es su propio
 * emisor ante Hacienda.
 */
function obtenerConfigEmisor(empresa) {
  return {
    tipoIdentificacion: empresa.tipo_identificacion,
    cedula: empresa.identificacion,
    nombre: empresa.nombre,
    nombreComercial: empresa.nombre_comercial,
    ubicacion: {
      provincia: empresa.provincia,
      canton: empresa.canton,
      distrito: empresa.distrito,
      barrio: empresa.barrio,
      senasExtra: empresa.senas_extra,
    },
    telefono: {
      codigoPais: '506',
      numero: empresa.telefono,
    },
    email: empresa.email,
    actividadEconomica: empresa.actividad_economica,
    sucursal: empresa.sucursal,
    terminal: empresa.terminal,
  };
}

module.exports = { obtenerConfigEmisor };