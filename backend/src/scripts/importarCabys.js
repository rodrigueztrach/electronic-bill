/**
 * Importa el catálogo CABYS a la base de datos desde el CSV oficial del
 * Ministerio de Hacienda (formato jerárquico de 9 niveles de categoría,
 * delimitado por punto y coma ";").
 *
 * Uso:
 *   node src/scripts/importarCabys.js ruta/al/catalogo.csv
 *
 * Estructura real del archivo:
 *   Fila 1: vacía (solo separadores ";;;;...")
 *   Fila 2: encabezados -> Categoría 1, Descripción (categoría 1), ...,
 *           Categoría 9, Descripción (categoría 9), Impuesto,
 *           Nota explicativa 1. Incluye, Nota explicativa 2. Excluye
 *   Fila 3 en adelante: datos.
 *
 * El código CABYS real de 13 dígitos y su descripción están en la ÚLTIMA
 * columna "Categoría N" (normalmente la 9) y su "Descripción (categoría N)"
 * inmediata. Este script detecta automáticamente cuáles son esas columnas
 * leyendo el encabezado, así no importa si tu versión del catálogo trae
 * 8 o 9 niveles.
 *
 * NOTA: se usa la librería csv-parse (no un split manual) porque el
 * archivo tiene campos entre comillas con comas y saltos de línea
 * internos (notas explicativas de varias líneas), que un split simple
 * por línea o por coma no puede manejar de forma confiable.
 */
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const sequelize = require('../config/db');
const CabysCodigo = require('../models/CabysCodigo');

const TAMANO_LOTE = 1000;

/** Convierte el texto de la columna "Impuesto" a { porcentaje, esExento } o null si la fila debe omitirse. */
function interpretarImpuesto(valorCrudo) {
  const v = (valorCrudo || '').trim();

  if (v === 'Exento') return { porcentaje: 0, esExento: true };
  if (v === 'na' || v === '') return null; // filas especiales (p.ej. transferencias) sin IVA aplicable

  const match = v.match(/^(\d+(\.\d+)?)\s*%$/);
  if (!match) return null; // valor no reconocido, se omite en vez de adivinar
  return { porcentaje: Number(match[1]), esExento: false };
}

async function importar(rutaCsv) {
  if (!rutaCsv) {
    console.error('Debes indicar la ruta al archivo CSV. Ejemplo:');
    console.error('  node src/scripts/importarCabys.js ./cabys.csv');
    process.exit(1);
  }

  const rutaAbsoluta = path.resolve(rutaCsv);
  if (!fs.existsSync(rutaAbsoluta)) {
    console.error(`No se encontró el archivo: ${rutaAbsoluta}`);
    process.exit(1);
  }

  await sequelize.authenticate();
  await CabysCodigo.sync(); // crea la tabla si no existe

  let contenido = fs.readFileSync(rutaAbsoluta, 'utf8');

  // La primera línea del archivo oficial es solo separadores vacíos
  // (";;;;...."), no es el encabezado real. Se descarta para que la
  // fila 2 (encabezados reales) sea tomada correctamente.
  const primerSalto = contenido.indexOf('\n');
  const primeraLinea = contenido.slice(0, primerSalto).replace(/[;\r]/g, '');
  if (primeraLinea.trim() === '') {
    contenido = contenido.slice(primerSalto + 1);
  }

  const registros = parse(contenido, {
    delimiter: ';',
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    bom: true,
  });

  console.log(`Filas leídas del CSV: ${registros.length}`);

  // Detecta automáticamente cuál es la última columna "Categoría N"
  // (el código más profundo/específico) y su descripción inmediata.
  const columnas = Object.keys(registros[0] || {});
  let claveCodigo = null;
  let claveDescripcion = null;
  let claveImpuesto = null;

  columnas.forEach((col, i) => {
    const texto = col.trim().toLowerCase();
    if (texto.startsWith('categoría') || texto.startsWith('categoria')) {
      claveCodigo = col;
      claveDescripcion = columnas[i + 1];
    }
    if (texto.startsWith('impuesto')) {
      claveImpuesto = col;
    }
  });

  console.log(`Columnas detectadas -> código: "${claveCodigo}", descripción: "${claveDescripcion}", impuesto: "${claveImpuesto}"`);

  if (!claveCodigo || !claveImpuesto) {
    console.error('No se pudieron detectar las columnas de código/impuesto en el encabezado. Revisa el CSV.');
    process.exit(1);
  }

  let lote = [];
  let totalInsertados = 0;
  let totalIgnoradas = 0;

  for (const fila of registros) {
    const codigo = (fila[claveCodigo] || '').replace(/\D/g, '').padStart(13, '0');
    const descripcion = (fila[claveDescripcion] || '').trim().slice(0, 300);
    const impuesto = interpretarImpuesto(fila[claveImpuesto]);

    if (codigo.length !== 13 || !descripcion || !impuesto) {
      totalIgnoradas++;
      continue;
    }

    lote.push({
      codigo,
      descripcion,
      porcentaje_iva: impuesto.porcentaje,
      es_exento: impuesto.esExento,
    });

    if (lote.length >= TAMANO_LOTE) {
      await CabysCodigo.bulkCreate(lote, { updateOnDuplicate: ['descripcion', 'porcentaje_iva', 'es_exento'] });
      totalInsertados += lote.length;
      console.log(`Importados ${totalInsertados} códigos...`);
      lote = [];
    }
  }

  if (lote.length > 0) {
    await CabysCodigo.bulkCreate(lote, { updateOnDuplicate: ['descripcion', 'porcentaje_iva', 'es_exento'] });
    totalInsertados += lote.length;
  }

  console.log(`Importación completa. Códigos cargados: ${totalInsertados}. Filas ignoradas (inválidas): ${totalIgnoradas}.`);
  process.exit(0);
}

const rutaCsv = process.argv[2];
importar(rutaCsv).catch((err) => {
  console.error('Error durante la importación:', err);
  process.exit(1);
});