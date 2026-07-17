/**
 * Generación de la Clave Numérica (50 dígitos) y el Consecutivo (20 dígitos)
 * según la estructura definida por el Ministerio de Hacienda de Costa Rica
 * (Factura Electrónica v4.3).
 *
 * CONSECUTIVO (20 dígitos):
 *   Sucursal (3) + Terminal (5) + Tipo de documento (2) + Consecutivo (10)
 *
 * CLAVE (50 dígitos):
 *   País (3) + Día (2) + Mes (2) + Año (2) + Cédula emisor (12, con ceros a la izquierda
 *   según tipo: físico 9 dígitos / jurídico 10 / DIMEX 11-12)
 *   + Consecutivo (20) + Situación comprobante (1) + Código de seguridad (8)
 */

function pad(value, length) {
  return String(value).padStart(length, '0');
}

/**
 * Arma el consecutivo de 20 dígitos.
 * @param {string} sucursal - 3 dígitos
 * @param {string} terminal - 5 dígitos
 * @param {string} tipoDocumento - 2 dígitos (01 Factura, 02 ND, 03 NC, 04 Tiquete, etc.)
 * @param {number} numero - número consecutivo interno (sin padding)
 */
function generarConsecutivo({ sucursal, terminal, tipoDocumento, numero }) {
  return (
    pad(sucursal, 3) +
    pad(terminal, 5) +
    pad(tipoDocumento, 2) +
    pad(numero, 10)
  );
}

/**
 * Genera un código de seguridad aleatorio de 8 dígitos.
 */
function generarCodigoSeguridad() {
  return pad(Math.floor(Math.random() * 1e8), 8);
}

/**
 * Genera la clave numérica de 50 dígitos.
 * @param {object} params
 * @param {Date} params.fecha - fecha de emisión
 * @param {string} params.cedulaEmisor - cédula del emisor sin guiones
 * @param {string} params.consecutivo - consecutivo ya generado (20 dígitos)
 * @param {string} [params.situacion='1'] - 1 Normal, 2 Contingencia, 3 Sin internet
 * @param {string} [params.codigoPais='506']
 */
function generarClave({ fecha, cedulaEmisor, consecutivo, situacion = '1', codigoPais = '506' }) {
  const dd = pad(fecha.getDate(), 2);
  const mm = pad(fecha.getMonth() + 1, 2);
  const yy = pad(fecha.getFullYear() % 100, 2);

  const cedula12 = pad(cedulaEmisor.replace(/\D/g, ''), 12);
  const codigoSeguridad = generarCodigoSeguridad();

  const clave =
    pad(codigoPais, 3) +
    dd + mm + yy +
    cedula12 +
    consecutivo +
    situacion +
    codigoSeguridad;

  if (clave.length !== 50) {
    throw new Error(`La clave generada no tiene 50 dígitos (tiene ${clave.length}): ${clave}`);
  }
  return clave;
}

module.exports = {
  generarConsecutivo,
  generarClave,
  generarCodigoSeguridad,
  pad,
};
