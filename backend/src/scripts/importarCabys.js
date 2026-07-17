/**
 * Importa el catálogo CABYS a la base de datos desde un archivo CSV.
 *
 * Uso:
 *   node src/scripts/importarCabys.js ruta/al/catalogo.csv
 *
 * El CSV debe tener 3 columnas, con encabezado, en este orden:
 *   codigo,descripcion,impuesto
 * donde "impuesto" es el porcentaje de IVA (0, 1, 2, 4, 8 o 13).
 *
 * Si tu Excel oficial trae los encabezados en otro orden o con otros
 * nombres (p.ej. "Código", "Descripción", "Impuesto"), ábrelo en Excel/
 * Google Sheets, deja solo esas 3 columnas, renómbralas exactamente así,
 * y expórtalo como CSV (UTF-8) antes de correr este script.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const sequelize = require('../config/db');
const CabysCodigo = require('../models/CabysCodigo');

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

  const rl = readline.createInterface({
    input: fs.createReadStream(rutaAbsoluta, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let esEncabezado = true;
  let lote = [];
  let totalInsertados = 0;
  const TAMANO_LOTE = 1000;

  for await (const linea of rl) {
    if (!linea.trim()) continue;

    if (esEncabezado) {
      esEncabezado = false;
      continue; // saltamos la fila de encabezados
    }

    const columnas = parsearLineaCsv(linea);
    if (columnas.length < 3) continue;

    const [codigoRaw, descripcionRaw, impuestoRaw] = columnas;
    const codigo = codigoRaw.replace(/\D/g, '').padStart(13, '0');
    const descripcion = descripcionRaw.trim().slice(0, 300);
    const porcentajeIva = parseFloat((impuestoRaw || '13').replace('%', '').replace(',', '.').trim()) || 0;

    if (codigo.length !== 13) continue; // fila inválida, se ignora

    lote.push({
      codigo,
      descripcion,
      porcentaje_iva: porcentajeIva,
      es_exento: porcentajeIva === 0,
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

  console.log(`Importación completa. Total de códigos CABYS cargados: ${totalInsertados}`);
  process.exit(0);
}

/** Parser simple de CSV que respeta comas dentro de comillas dobles. */
function parsearLineaCsv(linea) {
  const resultado = [];
  let actual = '';
  let dentroDeComillas = false;

  for (let i = 0; i < linea.length; i++) {
    const char = linea[i];
    if (char === '"') {
      dentroDeComillas = !dentroDeComillas;
    } else if (char === ',' && !dentroDeComillas) {
      resultado.push(actual);
      actual = '';
    } else {
      actual += char;
    }
  }
  resultado.push(actual);
  return resultado;
}

const rutaCsv = process.argv[2];
importar(rutaCsv).catch((err) => {
  console.error('Error durante la importación:', err);
  process.exit(1);
});