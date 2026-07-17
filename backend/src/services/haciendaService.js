const axios = require('axios');
require('dotenv').config();

let tokenCache = { access_token: null, expires_at: 0 };

/**
 * Obtiene un token OAuth2 (password grant) del Identity Provider de Hacienda.
 * El token se cachea en memoria hasta que expira.
 */
async function obtenerToken() {
  const ahora = Date.now();
  if (tokenCache.access_token && ahora < tokenCache.expires_at) {
    return tokenCache.access_token;
  }

  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', process.env.HACIENDA_CLIENT_ID);
  params.append('username', process.env.HACIENDA_USERNAME);
  params.append('password', process.env.HACIENDA_PASSWORD);

  const { data } = await axios.post(process.env.HACIENDA_IDP_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  tokenCache = {
    access_token: data.access_token,
    // restamos 30s de margen de seguridad
    expires_at: ahora + (data.expires_in - 30) * 1000,
  };

  return tokenCache.access_token;
}

/**
 * Envía un comprobante electrónico (XML firmado, en base64) a la API de
 * Recepción de Hacienda.
 */
async function enviarComprobante({ clave, fechaEmision, xmlFirmadoBase64, emisor, receptor, callbackUrl }) {
  const token = await obtenerToken();

  const body = {
    clave,
    fecha: fechaEmision, // formato ISO 8601
    emisor: {
      tipoIdentificacion: emisor.tipoIdentificacion,
      numeroIdentificacion: emisor.cedula,
    },
    receptor: receptor && {
      tipoIdentificacion: receptor.tipo_identificacion,
      numeroIdentificacion: receptor.identificacion,
    },
    comprobanteXml: xmlFirmadoBase64,
  };
  if (callbackUrl) body.callbackUrl = callbackUrl;

  const { data, status } = await axios.post(
    `${process.env.HACIENDA_API_URL}/recepcion`,
    body,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );

  return { status, data };
}

/**
 * Consulta el estado de un comprobante ya enviado, usando su clave de 50 dígitos.
 */
async function consultarEstado(clave) {
  const token = await obtenerToken();

  const { data } = await axios.get(
    `${process.env.HACIENDA_API_URL}/recepcion/${clave}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data; // incluye ind-estado: recibido | procesando | aceptado | rechazado
}

module.exports = { obtenerToken, enviarComprobante, consultarEstado };
