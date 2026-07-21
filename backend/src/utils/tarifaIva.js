/**
 * Catálogo oficial de CodigoTarifaIVA — Anexo v4.4, nota 8.1 (Ministerio de Hacienda).
 * Fuente: https://www.hacienda.go.cr/docs/ANEXOS_Y_ESTRUCTURAS_V4.4.pdf
 *
 * Códigos 05, 06 y 07 son de uso exclusivo/inhabilitado (notas de crédito/débito,
 * o código deshabilitado) y no se incluyen aquí porque no aplican a facturación normal.
 */
const TARIFA_IVA_POR_PORCENTAJE = {
  0: '01',    // Tarifa 0% (Artículo 32, num 1, RLIVA)
  1: '02',    // Tarifa reducida 1%
  2: '03',    // Tarifa reducida 2%
  4: '04',    // Tarifa reducida 4%
  13: '08',   // Tarifa general 13%
  0.5: '09',  // Tarifa reducida 0.5%
};

// Código a usar cuando el producto está marcado es_exento = true.
const CODIGO_TARIFA_EXENTO = '01';

function codigoTarifaIVA({ porcentaje, esExento }) {
  if (esExento) return CODIGO_TARIFA_EXENTO;

  const p = Number(porcentaje);
  const codigo = TARIFA_IVA_POR_PORCENTAJE[p];
  if (!codigo) {
    throw new Error(
      `No existe código de tarifa IVA para ${p}%. Verifica el producto o actualiza el catálogo en utils/tarifaIva.js contra el Anexo v4.4 vigente.`
    );
  }
  return codigo;
}

module.exports = { codigoTarifaIVA, TARIFA_IVA_POR_PORCENTAJE, CODIGO_TARIFA_EXENTO };