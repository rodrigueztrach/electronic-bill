const fs = require('fs');
const forge = require('node-forge');
const { SignedXml } = require('xml-crypto');
require('dotenv').config();

/**
 * IMPORTANTE:
 * Hacienda exige que el XML se firme con el estándar XAdES-BES, usando la
 * "llave criptográfica" (.p12) que la empresa descarga de ATV (Administración
 * Tributaria Virtual). La firma XAdES-BES tiene requisitos adicionales al
 * XML-DSig estándar (KeyInfo con el certificado X.509, SignedProperties,
 * política de firma, etc.).
 *
 * La librería `xml-crypto` firma XML-DSig "plano". Para cumplir 100% con
 * XAdES-BES normalmente se usa una librería especializada (p.ej. una réplica
 * en Node de xmlsec, o un microservicio en Java con la librería oficial
 * que publica el Ministerio de Hacienda: https://github.com/Hacienda-CR).
 *
 * Este servicio deja lista la carga del certificado .p12 y una firma
 * XML-DSig básica como PUNTO DE PARTIDA. Debes reemplazar/objetivo
 * `firmarXml` para producir una firma XAdES-BES válida antes de ir a
 * producción.
 */

function cargarCertificado() {
  const p12Path = process.env.CERT_P12_PATH;
  const p12Password = process.env.CERT_P12_PASSWORD;

  if (!fs.existsSync(p12Path)) {
    throw new Error(
      `No se encontró el archivo de certificado en ${p12Path}. Coloca tu llave ` +
      `criptográfica .p12 (descargada de ATV) en esa ruta y configura CERT_P12_PASSWORD.`
    );
  }

  const p12Buffer = fs.readFileSync(p12Path);
  const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, p12Password);

  const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
  const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });

  const privateKeyObj = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
  const certObj = certBags[forge.pki.oids.certBag][0].cert;

  const privateKeyPem = forge.pki.privateKeyToPem(privateKeyObj);
  const certPem = forge.pki.certificateToPem(certObj);

  return { privateKeyPem, certPem };
}

/**
 * Firma el XML del comprobante. Devuelve el XML firmado como string.
 * @param {string} xmlString - XML del comprobante sin firmar
 */
function firmarXml(xmlString) {
  const { privateKeyPem, certPem } = cargarCertificado();

  const sig = new SignedXml({
    privateKey: privateKeyPem,
    publicCert: certPem,
  });

  // Firma del documento completo (enveloped signature), como exige Hacienda.
  sig.addReference({
    xpath: "//*[local-name(.)='FacturaElectronica']",
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
  });

  sig.canonicalizationAlgorithm = 'http://www.w3.org/2001/10/xml-exc-c14n#';
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

  sig.computeSignature(xmlString, {
    location: { reference: "//*[local-name(.)='FacturaElectronica']", action: 'append' },
  });

  return sig.getSignedXml();
}

module.exports = { firmarXml, cargarCertificado };
