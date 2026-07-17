const { Factura, DetalleFactura, Cliente, Producto, sequelize } = require('../models');
const { generarConsecutivo, generarClave } = require('../utils/clave');
const { construirXmlFactura } = require('../services/xmlService');
const { firmarXml } = require('../services/firmaService');
const haciendaService = require('../services/haciendaService');
const emisorCfg = require('../config/emisor');

/**
 * Calcula los montos de cada línea y los totales de la factura a partir
 * de las líneas recibidas del frontend: [{ producto_id, cantidad, monto_descuento }]
 */
async function calcularLineasYTotales(lineasInput) {
  let totalGravado = 0;
  let totalExento = 0;
  let totalImpuesto = 0;

  const lineas = [];
  for (let i = 0; i < lineasInput.length; i++) {
    const li = lineasInput[i];
    const producto = await Producto.findByPk(li.producto_id);
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

async function crear(req, res, next) {
  const t = await sequelize.transaction();
  try {
    const {
      cliente_id,
      tipo_documento = '01',
      condicion_venta = '01',
      medio_pago = '01',
      moneda = 'CRC',
      lineas: lineasInput,
    } = req.body;

    if (!cliente_id) return res.status(400).json({ error: 'cliente_id es requerido' });
    if (!Array.isArray(lineasInput) || lineasInput.length === 0) {
      return res.status(400).json({ error: 'Debe incluir al menos una línea de detalle' });
    }

    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

    // 1) Consecutivo: siguiente número para este tipo de documento
    const cantidadPrevias = await Factura.count({ where: { tipo_documento } });
    const numeroConsecutivo = cantidadPrevias + 1;
    const consecutivo = generarConsecutivo({
      sucursal: emisorCfg.sucursal,
      terminal: emisorCfg.terminal,
      tipoDocumento: tipo_documento,
      numero: numeroConsecutivo,
    });

    // 2) Clave numérica de 50 dígitos
    const fechaEmision = new Date();
    const clave = generarClave({
      fecha: fechaEmision,
      cedulaEmisor: emisorCfg.cedula,
      consecutivo,
    });

    // 3) Cálculo de líneas y totales
    const { lineas, totales } = await calcularLineasYTotales(lineasInput);

    // 4) Persistencia inicial (estado pendiente)
    const factura = await Factura.create({
      tipo_documento,
      clave,
      consecutivo,
      fecha_emision: fechaEmision,
      cliente_id,
      condicion_venta,
      medio_pago,
      moneda,
      ...totales,
      estado_hacienda: 'pendiente',
    }, { transaction: t });

    await DetalleFactura.bulkCreate(
      lineas.map((l) => ({ ...l, factura_id: factura.id })),
      { transaction: t }
    );

    await t.commit();

    // 5) Generar XML + firmar (fuera de la transacción de BD)
    const xmlSinFirmar = construirXmlFactura({ factura, cliente, detalles: lineas });

    let xmlFirmado;
    try {
      xmlFirmado = firmarXml(xmlSinFirmar);
    } catch (errFirma) {
      // Si no hay certificado configurado (ambiente de desarrollo), guardamos
      // el XML sin firmar y marcamos el estado para revisión manual.
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

    // 6) Envío a Hacienda
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
      include: [Cliente],
      order: [['fecha_emision', 'DESC']],
    });
    res.json(facturas);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const factura = await Factura.findByPk(req.params.id, {
      include: [{ model: DetalleFactura, as: 'detalles' }, Cliente],
    });
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(factura);
  } catch (err) { next(err); }
}

/** Consulta a Hacienda el estado actual del comprobante y actualiza el registro local. */
async function consultarEstado(req, res, next) {
  try {
    const factura = await Factura.findByPk(req.params.id);
    if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });

    const data = await haciendaService.consultarEstado(factura.clave);
    await factura.update({
      estado_hacienda: data['ind-estado'] || factura.estado_hacienda,
      respuesta_hacienda: JSON.stringify(data),
    });

    res.json(factura);
  } catch (err) { next(err); }
}

module.exports = { crear, listar, obtener, consultarEstado };
