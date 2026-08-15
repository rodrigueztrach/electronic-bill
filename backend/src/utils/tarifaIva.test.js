import { describe, it, expect } from 'vitest';
const { codigoTarifaIVA, TARIFA_IVA_POR_PORCENTAJE, CODIGO_TARIFA_EXENTO } = require('./tarifaIva');

describe('codigoTarifaIVA', () => {

  describe('camino feliz - cada tarifa del catálogo', () => {
    it('retorna 01 para tarifa 0%', () => {
      expect(codigoTarifaIVA({ porcentaje: 0, esExento: false })).toBe('01');
    });

    it('retorna 02 para tarifa reducida 1%', () => {
      expect(codigoTarifaIVA({ porcentaje: 1, esExento: false })).toBe('02');
    });

    it('retorna 03 para tarifa reducida 2%', () => {
      expect(codigoTarifaIVA({ porcentaje: 2, esExento: false })).toBe('03');
    });

    it('retorna 04 para tarifa reducida 4%', () => {
      expect(codigoTarifaIVA({ porcentaje: 4, esExento: false })).toBe('04');
    });

    it('retorna 08 para tarifa general 13%', () => {
      expect(codigoTarifaIVA({ porcentaje: 13, esExento: false })).toBe('08');
    });

    it('retorna 09 para tarifa reducida 0.5%', () => {
      expect(codigoTarifaIVA({ porcentaje: 0.5, esExento: false })).toBe('09');
    });
  });

  describe('exención - tiene prioridad sobre el porcentaje', () => {
    it('retorna código exento (01) cuando esExento es true', () => {
      expect(codigoTarifaIVA({ porcentaje: 13, esExento: true })).toBe(CODIGO_TARIFA_EXENTO);
    });

    it('ignora el porcentaje aunque sea inválido, si esExento es true', () => {
      expect(codigoTarifaIVA({ porcentaje: 999, esExento: true })).toBe('01');
    });
  });

  describe('casos de error - tarifa no existe en el catálogo', () => {
    it('lanza error para un porcentaje no contemplado (15%)', () => {
      expect(() => codigoTarifaIVA({ porcentaje: 15, esExento: false })).toThrow(
        /No existe código de tarifa IVA/
      );
    });

    it('lanza error para el código 05 (deshabilitado a propósito)', () => {
      expect(() => codigoTarifaIVA({ porcentaje: 5, esExento: false })).toThrow();
    });

    it('lanza error si porcentaje es undefined', () => {
      expect(() => codigoTarifaIVA({ esExento: false })).toThrow();
    });

    it('lanza error si porcentaje es un texto no numérico', () => {
      expect(() => codigoTarifaIVA({ porcentaje: 'trece', esExento: false })).toThrow();
    });
  });

  describe('casos límite y de tipos', () => {
    it('acepta el porcentaje como string numérico ("13") y lo convierte', () => {
      expect(codigoTarifaIVA({ porcentaje: '13', esExento: false })).toBe('08');
    });

    it('trata esExento undefined como falsy (no lanza por eso)', () => {
      expect(codigoTarifaIVA({ porcentaje: 0 })).toBe('01');
    });

    it('lanza error si porcentaje es null', () => {
      expect(() => codigoTarifaIVA({ porcentaje: null, esExento: false })).toThrow();
    });
  });

  describe('integridad del catálogo', () => {
    it('el catálogo tiene exactamente 6 tarifas (sin contar 05/06/07 inhabilitados)', () => {
      expect(Object.keys(TARIFA_IVA_POR_PORCENTAJE)).toHaveLength(6);
    });

    it('no incluye los códigos 05, 06 ni 07', () => {
      const codigos = Object.values(TARIFA_IVA_POR_PORCENTAJE);
      expect(codigos).not.toContain('05');
      expect(codigos).not.toContain('06');
      expect(codigos).not.toContain('07');
    });
  });
});