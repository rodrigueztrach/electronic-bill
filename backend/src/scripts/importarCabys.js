/**
 * Importa el catálogo CABYS a la base de datos desde el CSV oficial del
 * BCCR/Hacienda (formato jerárquico de 9 niveles de categoría).
 *
 * Uso:
 *   node src/scripts/importarCabys.js ruta/al/catalogo.csv
 *
 * El archivo oficial tiene esta estructura real:
 *   Fila 1: vacía (solo comas)
 *   Fila 2: encabezados -> Categoría 1, Descripción (categoría 1), ...,
 *           Categoría 9, Descripción (categoría 9), Impuesto, ...
 *   Fila 3 en adelante: los datos.
 *
 * El código CABYS real de 13 dígitos y su descripción están en la ÚLTIMA
 * columna "Categoría N" (normalmente la 9) y su "Descripción (categoría N)"
 * inmediata. Este script detecta automáticamente cuáles son esas columnas
 * leyendo el encabezado, así que no importa si tu versión del catálogo
 * trae 8 o 9 niveles de categoría.
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

  let numeroLinea = 0;
  let idxCodigo = -1;
  let idxDescripcion = -1;
  let idxImpuesto = -1;

  let lote = [];
  let totalInsertados = 0;
  let totalIgnoradas = 0;
  const TAMANO_LOTE = 1000;

  for await (const linea of rl) {
    numeroLinea++;

    // Fila 1 del archivo oficial: solo comas, sin datos. La saltamos.
    if (numeroLinea === 1 && linea.replace(/,/g, '').trim() === '') {
      continue;
    }

    const columnas = parsearLineaCsv(linea);

    // Primera fila con contenido real = encabezados. Detectamos las columnas.
    if (idxCodigo === -1) {
      columnas.forEach((col, i) => {
        const texto = col.trim().toLowerCase();
        if (texto.startsWith('categoría') || texto.startsWith('categoria')) {
          // Nos quedamos con la ÚLTIMA columna "Categoría N" encontrada
          // (es la más profunda = el código CABYS real de 13 dígitos).
          idxCodigo = i;
          idxDescripcion = i + 1;
        }
        if (texto.startsWith('impuesto')) {
          idxImpuesto = i;
        }
      });

      console.log(`Encabezado detectado -> código: columna ${idxCodigo}, descripción: columna ${idxDescripcion}, impuesto: columna ${idxImpuesto}`);

      if (idxCodigo === -1 || idxImpuesto === -1) {
        console.error('No se pudieron detectar las columnas de código/impuesto en el encabezado. Revisa el CSV.');
        process.exit(1);
      }
      continue; // esta fila era el encabezado, no se inserta
    }

    if (!linea.trim()) continue;

    const codigoRaw = columnas[idxCodigo] || '';
    const descripcionRaw = columnas[idxDescripcion] || '';
    const impuestoRaw = columnas[idxImpuesto] || '';

    const codigo = codigoRaw.replace(/\D/g, '').padStart(13, '0');
    const descripcion = descripcionRaw.trim().slice(0, 300);
    const porcentajeIva = parseFloat(impuestoRaw.replace('%', '').replace(',', '.').trim());

    if (codigo.length !== 13 || !descripcion || Number.isNaN(porcentajeIva)) {
      totalIgnoradas++;
      continue; // fila inválida o incompleta, se ignora
    }

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

  console.log(`Importación completa. Códigos cargados: ${totalInsertados}. Filas ignoradas (inválidas): ${totalIgnoradas}.`);
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