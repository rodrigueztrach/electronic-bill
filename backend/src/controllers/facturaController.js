const { Factura, DetalleFactura, Cliente, Producto, Empresa, sequelize } = require('../models');
const { generarConsecutivo, generarClave } = require('../utils/clave');
const { codigoTarifaIVA } = require('../utils/tarifaIva');
const { construirXmlFactura } = require('../services/xmlService');
const { firmarXml } = require('../services/firmaService');
const haciendaService = require('../services/haciendaService');
const { obtenerConfigEmisor } = require('../services/emisorService');
const { QueryTypes } = require('sequelize');

async function calcularLineasYTotales(lineasInput, empresaId) {
  let totalGravado = 0;
  let totalExento = 0;
  let totalImpuesto = 0;

  const lineas = [];
  for (let i = 0; i < lineasInput.length; i++) {
    const li = lineasInput[i];
    const producto = await Producto.findOne({ where: { id: li.producto_id, empresa_id: empresaId } });
    if (!producto) {
      const e = new Error(`Producto ${li.producto_id} no encontrado`);
      e.status = 400;
      throw e;
    }

    const cantidad = Number(li.cantidad || 1);
    const precioUnitario = Number(producto.precio_unitario);
    const montoDescuento = Number(li.monto_descuento || 0);
    const bruto = cantidad * precioUnitario;
    const subtotal = bruto - montoDescuento;

    const porcentajeIva = producto.es_exento ? 0 : Number(producto.porcentaje_iva);
    const montoIva = +(subtotal * (porcentajeIva / 100)).toFixed(5);
    const montoTotalLinea = +(subtotal + montoIva).toFixed(5);

    const codigoTarifa = codigoTarifaIVA({ porcentaje: porcentajeIva, esExento: producto.es_exento });

    if (porcentajeIva > 0) totalGravado += subtotal;
    else totalExento += subtotal;
    totalImpuesto += montoIva;

    lineas.push({
      numero_linea: i + 1,
      producto_id: producto.id,
      codigo_cabys: producto.codigo_cabys,
      descripcion: producto.descripcion,
      cantidad,
      unidad_medida: producto.unidad_medida,
      precio_unitario: precioUnitario,
      monto_descuento: montoDescuento,
      subtotal: +subtotal.toFixed(5),
      porcentaje_iva: porcentajeIva,
      codigo_tarifa_iva: codigoTarifa,
      monto_iva: montoIva,
      monto_total_linea: montoTotalLinea,
    });
  }

  const totalVenta = +(totalGravado + totalExento).toFixed(5);
  const totalComprobante = +(totalVenta + totalImpuesto).toFixed(5);

  return {
    lineas,
    totales: {
      total_gravado: +totalGravado.toFixed(5),
      total_exento: +totalExento.toFixed(5),
      total_venta: totalVenta,
      total_impuesto: +totalImpuesto.toFixed(5),
      total_comprobante: totalComprobante,
    },
  };
}

/**
 * Reserva el siguiente consecutivo PARA ESTA EMPRESA. Si es la primera
 * vez que esta empresa emite este tipo de documento, crea la fila del
 * contador empezando en 0. FOR UPDATE bloquea la fila para evitar que
 * dos facturas casi simultáneas de la MISMA empresa reciban el mismo número.
 *
 * IMPORTANTE: se usa { type: QueryTypes.SELECT } para que sequelize.query
 * devuelva directamente el arreglo de filas (no la tupla [resultados, metadata]
 * por defecto). Sin esto, "rows" terminaba siendo el arreglo completo en vez
 * de una fila, y "rows.numero" daba undefined -> NaN.
 */
async function reservarConsecutivo(empresaId, tipoDocumento, t) {
  await sequelize.query(
    `INSERT INTO contadores_consecutivo (empresa_id, tipo_documento, numero)
     VALUES (:empresaId, :tipo, 0)
     ON CONFLICT (empresa_id, tipo_documento) DO NOTHING`,
    { replacements: { empresaId, tipo: tipoDocumento }, transaction: t }
  );

  const filas = await sequelize.query(
    `SELECT numero FROM contadores_consecutivo
     WHERE empresa_id = :empresaId AND tipo_documento = :tipo FOR UPDATE`,
    {
      replacements: { empresaId, tipo: tipoDocumento },
      transaction: t,
      type: QueryTypes.SELECT,
    }
  );

  if (!filas.length) {
    throw new Error(`No se pudo reservar consecutivo para empresa ${empresaId} / tipo ${tipoDocumento}`);
  }

  const numero = filas[0].numero + 1;
  await sequelize.query(
    `UPDATE contadores_consecutivo SET numero = :n
     WHERE empresa_id = :empresaId AND tipo_documento = :tipo`,
    { replacements: { n: numero, empresaId, tipo: tipoDocumento }, transaction: t }
  );
  return numero;
}

async function crear(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const empresaId = req.usuario.empresa_id;
    const {
      cliente_id,
      tipo_documento = '01',
      condicion_venta = '01',
      medio_pago = '01',
      moneda = 'CRC',
      tipo_cambio = 1,
      plazo_credito = null,
      lineas: lineasInput,
    } = req.body;

    if (!cliente_id) return res.status(400).json({ error: 'cliente_id es requerido' });
    if (!Array.isArray(lineasInput) || lineasInput.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos una línea de detalle' });
    }
    if (condicion_venta === '02' && !plazo_credito) {
      return res.status(400).json({ error: 'plazo_credito es requerido cuando la condición de venta es crédito' });
    }
    if (moneda !== 'CRC' && (!tipo_cambio || tipo_cambio <= 0)) {
      return res.status(400).json({ error: 'tipo_cambio inválido para moneda distinta de CRC' });
    }

    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) return res.status(400).json({ error: 'Empresa emisora no encontrada' });
    const emisorCfg = obtenerConfigEmisor(empresa);

    const cliente = await Cliente.findOne({ where: { id: cliente_id, empresa_id: empresaId } });
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    const numeroConsecutivo = await reservarConsecutivo(empresaId, tipo_documento, t);
    const consecutivo = generarConsecutivo({
      sucursal: emisorCfg.sucursal,
      terminal: emisorCfg.terminal,
      tipoDocumento: tipo_documento,
      numero: numeroConsecutivo,
    });

    const fechaEmision = new Date();
    const clave = generarClave({
      fecha: fechaEmision,
      cedulaEmisor: emisorCfg.cedula,
      consecutivo,
    });

    const { lineas, totales } = await calcularLineasYTotales(lineasInput, empresaId);

    const factura = await Factura.create({
      empresa_id: empresaId,
      tipo_documento,
      clave,
      consecutivo,
      fecha_emision: fechaEmision,
      cliente_id,
      condicion_venta,
      medio_pago,
      moneda,
      tipo_cambio: moneda !== 'CRC' ? tipo_cambio : 1,
      plazo_credito: condicion_venta === '02' ? Number(plazo_credito) : null,
      ...totales,
      estado_hacienda: 'pendiente',
    }, { transaction: t });

    await DetalleFactura.bulkCreate(
      lineas.map((l) => ({ ...l, factura_id: factura.id })),
      { transaction: t }
    );

    await t.commit();

    const xmlSinFirmar = construirXmlFactura({ factura, cliente, detalles: lineas, emisor: emisorCfg });

    let xmlFirmado;
    try {
      xmlFirmado = firmarXml(xmlSinFirmar);
    } catch (errFirma) {
      await factura.update({
        xml_firmado: xmlSinFirmar,
        estado_hacienda: 'error_firma',
        respuesta_hacienda: errFirma.message,
      });
      return res.status(201).json({
        factura,
        aviso: 'Factura creada pero no se pudo firmar el XML: ' + errFirma.message,
      });
    }

    await factura.update({ xml_firmado: xmlFirmado });

    try {
      const xmlBase64 = Buffer.from(xmlFirmado, 'utf8').toString('base64');
      const { status, data } = await haciendaService.enviarComprobante({
        clave,
        fechaEmision: fechaEmision.toISOString(),
        xmlFirmadoBase64: xmlBase64,
        emisor: emisorCfg,
        receptor: cliente,
      });

      await factura.update({
        estado_hacienda: status === 202 ? 'recibido' : 'error_envio',
        respuesta_hacienda: JSON.stringify(data || { status }),
      });
    } catch (errEnvio) {
      await factura.update({
        estado_hacienda: 'error_envio',
        respuesta_hacienda: errEnvio.response?.data ? JSON.stringify(errEnvio.response.data) : errEnvio.message,
      });
    }

    const facturaFinal = await Factura.findByPk(factura.id, {
      include: [{ model: DetalleFactura, as: 'detalles' }, Cliente],
    });

    return res.status(201).json(facturaFinal);
  } catch (err) {
    await t.rollback();
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const facturas = await Factura.findAll({
      where: { empresa_id: req.usuario.empresa_id },
      include: [Cliente],
      order: [['fecha_emision', 'DESC']],
    });
    res.json(facturas);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const factura = await Factura.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
      include: [{ model: DetalleFactura, as: 'detalles' }, Cliente],
    });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(factura);
  } catch (err) { next(err); }
}

async function consultarEstado(req, res, next) {
  try {
    const factura = await Factura.findOne({
      where: { id: req.params.id, empresa_id: req.usuario.empresa_id },
    });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    let data;
    try {
      data = await haciendaService.consultarEstado(factura.clave);
    } catch (errHacienda) {
      const detalle = errHacienda.response?.data || errHacienda.message;
      return res.status(502).json({
        error: 'No se pudo consultar el estado en Hacienda',
        detalles: detalle,
      });
    }

    await factura.update({
      estado_hacienda: data['ind-estado'] || factura.estado_hacienda,
      respuesta_hacienda: JSON.stringify(data),
    });

    res.json(factura);
  } catch (err) { next(err); }
}

module.exports = { crear, listar, obtener, consultarEstado };