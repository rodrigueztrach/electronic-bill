const { create } = require('xmlbuilder2');
const emisor = require('../config/emisor');

/**
 * Construye el XML de una Factura Electrónica (tipo 01) según la
 * estructura v4.3 del Ministerio de Hacienda.
 *
 * NOTA: Esta es una estructura BASE con los campos más comunes.
 * Debes ajustarla/completarla según tu caso real (exoneraciones,
 * otros cargos, referencias a otros documentos, moneda extranjera, etc.)
 * revisando el "Anexo v4.3" oficial.
 */
function construirXmlFactura({ factura, cliente, detalles }) {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('FacturaElectronica', {
      xmlns: 'https://cdn.comprobanteselectronicos.go.cr/xml-schemas/v4.3/facturaElectronica',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    });

  root.ele('Clave').txt(factura.clave).up();
  root.ele('ProveedorSistemas').txt(emisor.cedula).up();
  root.ele('CodigoActividadEmisor').txt(emisor.actividadEconomica).up();
  root.ele('NumeroConsecutivo').txt(factura.consecutivo).up();
  root.ele('FechaEmision').txt(factura.fecha_emision.toISOString().slice(0, 19)).up();

  // --- Emisor ---
  const em = root.ele('Emisor');
  em.ele('Nombre').txt(emisor.nombre).up();
  const idEm = em.ele('Identificacion');
  idEm.ele('Tipo').txt(emisor.tipoIdentificacion).up();
  idEm.ele('Numero').txt(emisor.cedula).up();
  idEm.up();
  if (emisor.nombreComercial) em.ele('NombreComercial').txt(emisor.nombreComercial).up();
  const ubEm = em.ele('Ubicacion');
  ubEm.ele('Provincia').txt(emisor.ubicacion.provincia).up();
  ubEm.ele('Canton').txt(emisor.ubicacion.canton).up();
  ubEm.ele('Distrito').txt(emisor.ubicacion.distrito).up();
  if (emisor.ubicacion.barrio) ubEm.ele('Barrio').txt(emisor.ubicacion.barrio).up();
  ubEm.ele('OtrasSenas').txt(emisor.ubicacion.senasExtra || 'N/A').up();
  ubEm.up();
  const telEm = em.ele('Telefono');
  telEm.ele('CodigoPais').txt(emisor.telefono.codigoPais).up();
  telEm.ele('NumTelefono').txt(emisor.telefono.numero).up();
  telEm.up();
  em.ele('CorreoElectronico').txt(emisor.email).up();
  em.up();

  // --- Receptor ---
  const rec = root.ele('Receptor');
  rec.ele('Nombre').txt(cliente.nombre).up();
  const idRec = rec.ele('Identificacion');
  idRec.ele('Tipo').txt(cliente.tipo_identificacion).up();
  idRec.ele('Numero').txt(cliente.identificacion).up();
  idRec.up();
  if (cliente.nombre_comercial) rec.ele('NombreComercial').txt(cliente.nombre_comercial).up();
  if (cliente.provincia) {
    const ubRec = rec.ele('Ubicacion');
    ubRec.ele('Provincia').txt(cliente.provincia).up();
    ubRec.ele('Canton').txt(cliente.canton).up();
    ubRec.ele('Distrito').txt(cliente.distrito).up();
    if (cliente.barrio) ubRec.ele('Barrio').txt(cliente.barrio).up();
    ubRec.ele('OtrasSenas').txt(cliente.senas_extra || 'N/A').up();
    ubRec.up();
  }
  if (cliente.telefono) {
    const telRec = rec.ele('Telefono');
    telRec.ele('CodigoPais').txt('506').up();
    telRec.ele('NumTelefono').txt(cliente.telefono).up();
    telRec.up();
  }
  if (cliente.email) rec.ele('CorreoElectronico').txt(cliente.email).up();
  rec.up();

  // --- Condición de venta / medio de pago ---
  root.ele('CondicionVenta').txt(factura.condicion_venta).up();
  const medioPago = root.ele('MedioPago');
  medioPago.ele('TipoMedioPago').txt(factura.medio_pago).up();
  medioPago.up();

  // --- Detalle del servicio ---
  const detalleServicio = root.ele('DetalleServicio');
  detalles.forEach((linea, i) => {
    const ld = detalleServicio.ele('LineaDetalle');
    ld.ele('NumeroLinea').txt(String(i + 1)).up();
    ld.ele('CodigoCABYS').txt(linea.codigo_cabys).up();
    ld.ele('Cantidad').txt(String(linea.cantidad)).up();
    ld.ele('UnidadMedida').txt(linea.unidad_medida).up();
    ld.ele('Detalle').txt(linea.descripcion).up();
    ld.ele('PrecioUnitario').txt(Number(linea.precio_unitario).toFixed(5)).up();
    ld.ele('MontoTotal').txt((linea.cantidad * linea.precio_unitario).toFixed(5)).up();
    if (Number(linea.monto_descuento) > 0) {
      const desc = ld.ele('Descuento');
      desc.ele('MontoDescuento').txt(Number(linea.monto_descuento).toFixed(5)).up();
      desc.ele('NaturalezaDescuento').txt('Descuento comercial').up();
      desc.up();
    }
    ld.ele('SubTotal').txt(Number(linea.subtotal).toFixed(5)).up();
    if (Number(linea.porcentaje_iva) > 0) {
      const imp = ld.ele('Impuesto');
      imp.ele('Codigo').txt('01').up(); // 01 = IVA
      imp.ele('CodigoTarifaIVA').txt(codigoTarifaIVA(linea.porcentaje_iva)).up();
      imp.ele('Tarifa').txt(Number(linea.porcentaje_iva).toFixed(2)).up();
      imp.ele('Monto').txt(Number(linea.monto_iva).toFixed(5)).up();
      imp.up();
    }
    ld.ele('ImpuestoNeto').txt(Number(linea.monto_iva || 0).toFixed(5)).up();
    ld.ele('MontoTotalLinea').txt(Number(linea.monto_total_linea).toFixed(5)).up();
    ld.up();
  });
  detalleServicio.up();

  // --- Resumen de la factura ---
  const resumen = root.ele('ResumenFactura');
  const totalesGrav = resumen.ele('TotalesTransaccion') ? null : null; // placeholder si se requiere sub-nodo
  resumen.ele('CodigoTipoMoneda').ele('CodigoMoneda').txt(factura.moneda).up().up();
  resumen.ele('TotalServGravados').txt('0.00000').up();
  resumen.ele('TotalServExentos').txt('0.00000').up();
  resumen.ele('TotalMercanciasGravadas').txt(Number(factura.total_gravado).toFixed(5)).up();
  resumen.ele('TotalMercanciasExentas').txt(Number(factura.total_exento).toFixed(5)).up();
  resumen.ele('TotalGravado').txt(Number(factura.total_gravado).toFixed(5)).up();
  resumen.ele('TotalExento').txt(Number(factura.total_exento).toFixed(5)).up();
  resumen.ele('TotalVenta').txt(Number(factura.total_venta).toFixed(5)).up();
  resumen.ele('TotalDescuentos').txt('0.00000').up();
  resumen.ele('TotalVentaNeta').txt(Number(factura.total_venta).toFixed(5)).up();
  resumen.ele('TotalImpuesto').txt(Number(factura.total_impuesto).toFixed(5)).up();
  resumen.ele('TotalComprobante').txt(Number(factura.total_comprobante).toFixed(5)).up();
  resumen.up();

  root.up();

  return root.end({ prettyPrint: true });
}

/**
 * Mapea el porcentaje de IVA al código de tarifa que exige Hacienda.
 * 01: 1%, 02: 2%, 03: 4% (antiguo), 04: 8%, 08: 13% (tarifa general), 09: exento/0%
 * (Consulta la tabla de códigos vigente en el Anexo v4.3, esto es orientativo.)
 */
function codigoTarifaIVA(porcentaje) {
  const p = Number(porcentaje);
  const mapa = { 0: '01', 1: '09', 2: '10', 4: '11', 8: '12', 13: '08' };
  return mapa[p] || '08';
}

module.exports = { construirXmlFactura };
