import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Barra de navegación pública reutilizable para todas las pestañas públicas
function NavbarPublico() {
  return (
    <header style={{ backgroundColor: '#004080', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '35px', height: '35px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Facturación CR</span>
      </div>
      <nav style={{ display: 'flex', gap: '25px', fontSize: '15px', alignItems: 'center' }}>
        <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/nosotros" style={{ color: '#fff', textDecoration: 'none' }}>Nosotros</Link>
        <Link to="/servicios" style={{ color: '#fff', textDecoration: 'none' }}>Servicios</Link>
        <Link to="/planes" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Planes</Link>
        <Link to="/registro" style={{ color: '#fff', textDecoration: 'none' }}>Regístrese</Link>
        <Link to="/contacto" style={{ color: '#fff', textDecoration: 'none' }}>Contáctenos</Link>
      </nav>
    </header>
  );
}

// --- Datos de los planes ---
const PLANES_INDEPENDIENTE = [
  {
    nombre: 'PLAN PLUS ILIMITADO FÍSICO ANUAL',
    masVendido: true,
    precio: '$70',
    periodo: 'Anual + IVA',
    limite: 'Sin límite de documentos al año',
    descripcion: 'Facturar.CR ofrece su plan plus para aquellos trabajadores independientes que deseen emitir documentos electrónicos sin restricción de cantidad.',
  },
  {
    nombre: 'PLAN PLUS ILIMITADO FÍSICO MENSUAL',
    precio: '$7',
    periodo: 'Mensual + IVA',
    limite: 'Sin límite de documentos al mes',
    descripcion: 'Facturar.CR ofrece su plan plus para aquellos trabajadores independientes que deseen emitir documentos electrónicos sin restricción de cantidad.',
  },
  {
    nombre: 'PLAN 25 FÍSICO ANUAL',
    precio: '$18',
    periodo: 'Anual + IVA',
    limite: 'Hasta 25 documentos al año',
    descripcion: 'Pensando en los trabajadores independientes con un bajo volumen de facturas emitidas anualmente.',
  },
  {
    nombre: 'PLAN 60 FÍSICO ANUAL',
    precio: '$28',
    periodo: 'Anual + IVA',
    limite: 'Hasta 60 documentos al año',
    descripcion: 'Muy conveniente para trabajadores independientes que emiten un volumen de documentos mediano anualmente.',
  },
];

const PLANES_EMPRESA = [
  {
    nombre: 'PLAN 100 JURÍDICO ANUAL',
    masVendido: true,
    precio: '$70',
    periodo: 'Anual + IVA',
    limite: 'Hasta 1200 documentos al año',
    descripcion: 'En facturar.cr también pensamos en su empresa. Permítanos generar hasta 1200 documentos anuales con este plan.',
  },
  {
    nombre: 'PLAN 100 JURÍDICO MENSUAL',
    precio: '$7',
    periodo: 'Mensual + IVA',
    limite: 'Hasta 100 documentos al mes',
    descripcion: 'En facturar.cr también pensamos en su empresa. Permítanos generar hasta 100 documentos mensuales con este plan.',
  },
  {
    nombre: 'PLAN 50 JURÍDICO ANUAL',
    precio: '$35',
    periodo: 'Anual + IVA',
    limite: 'Hasta 50 documentos al año',
    descripcion: 'Pensado para empresas con un bajo volumen de facturas emitidas anualmente.',
  },
  {
    nombre: 'PLAN 75 JURIDICO ANUAL',
    precio: '$45',
    periodo: 'Anual + IVA',
    limite: 'Hasta 75 documentos al año',
    descripcion: 'En facturar.cr también pensamos en su empresa. Permítanos generar hasta 75 documentos anuales con este plan.',
  },
  {
    nombre: 'PLAN 250 JURÍDICO ANUAL',
    precio: '$120',
    periodo: 'Anual + IVA',
    limite: 'Hasta 3000 documentos al año',
    descripcion: 'En facturar.cr también pensamos en su empresa. Permítanos generar hasta 3000 documentos anuales con este plan.',
  },
  {
    nombre: 'PLAN 250 JURÍDICO MENSUAL',
    precio: '$12',
    periodo: 'Mensual + IVA',
    limite: 'Hasta 250 documentos al mes',
    descripcion: 'En facturar.cr también pensamos en su empresa. Permítanos generar hasta 250 documentos mensuales con este plan.',
  },
  {
    nombre: 'PLAN 500 JURÍDICO ANUAL',
    precio: '$230',
    periodo: 'Anual + IVA',
    limite: 'Hasta 6000 documentos al año',
    descripcion: 'Para aquellas empresas que generan un volumen de documentos considerable mensualmente, ofrecemos el Plan 500. Gestione hasta 6000 documentos al año con este plan.',
  },
  {
    nombre: 'PLAN 500 JURÍDICO MENSUAL',
    precio: '$23',
    periodo: 'Mensual + IVA',
    limite: 'Hasta 500 documentos al mes',
    descripcion: 'Para aquellas empresas que generan un volumen de documentos considerable mensualmente, ofrecemos el Plan 500. Gestione hasta 500 documentos al mes con este plan.',
  },
];

// --- Tarjeta individual de plan ---
function TarjetaPlan({ plan }) {
  return (
    <div style={{ position: 'relative', backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {plan.masVendido && (
        <div style={{ position: 'absolute', top: '14px', left: '14px', backgroundColor: '#f5a623', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '5px 10px', borderRadius: '3px', letterSpacing: '0.5px' }}>
          ★ MÁS VENDIDO
        </div>
      )}
      <div style={{ height: '6px', backgroundColor: '#004080' }} />
      <div style={{ padding: '30px 25px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '18px', color: '#004080', fontWeight: 'bold', textAlign: 'center', margin: '10px 0 20px 0', lineHeight: '1.3' }}>
          {plan.nombre}
        </h3>

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#004080' }}>{plan.precio}</span>
          <span style={{ fontSize: '14px', color: '#777' }}> / {plan.periodo}</span>
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#004080', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '12px 0', marginBottom: '18px' }}>
          {plan.limite}
        </p>

        <p style={{ fontSize: '13.5px', color: '#555', lineHeight: '1.6', textAlign: 'center', flexGrow: 1 }}>
          {plan.descripcion}
        </p>

        <button
          style={{
            backgroundColor: '#324b7d',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Me interesa
        </button>
      </div>
    </div>
  );
}

// --- Tarjeta de plan personalizado ---
function TarjetaPersonalizado() {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
      <div style={{ height: '6px', backgroundColor: '#004080' }} />
      <div style={{ padding: '30px 25px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '18px', color: '#004080', fontWeight: 'bold', margin: '10px 0 20px 0' }}>
          PLAN PERSONALIZADO
        </h3>

        <div style={{ marginBottom: '15px' }}>
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#004080' }}>Precio variable + IVA</span>
        </div>

        <p style={{ fontSize: '14px', color: '#004080', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd', padding: '12px 0', marginBottom: '18px' }}>
          Volúmenes especiales
        </p>

        <p style={{ fontSize: '13.5px', color: '#555', lineHeight: '1.6' }}>
          ¿Necesitás algo diferente? Personaliza un plan que se ajuste perfectamente al volumen y características de tu facturación electrónica. Contáctanos y lo diseñamos juntos.
        </p>

        <button
          style={{
            backgroundColor: '#324b7d',
            color: '#fff',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Me interesa
        </button>
      </div>
    </div>
  );
}

export default function Planes() {
  const [tipo, setTipo] = useState('independiente'); // 'independiente' | 'empresa'

  const botonBase = {
    padding: '12px 30px',
    fontSize: '15px',
    fontWeight: 'bold',
    border: '1px solid #004080',
    cursor: 'pointer',
    borderRadius: '4px',
  };

  const botonActivo = { ...botonBase, backgroundColor: '#004080', color: '#fff' };
  const botonInactivo = { ...botonBase, backgroundColor: '#fff', color: '#004080' };

  const planes = tipo === 'independiente' ? PLANES_INDEPENDIENTE : PLANES_EMPRESA;

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* --- Barra de Navegación Superior --- */}
      <NavbarPublico />

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Toggle Trabajador Independiente / Empresa */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '35px' }}>
          <button
            style={tipo === 'independiente' ? botonActivo : botonInactivo}
            onClick={() => setTipo('independiente')}
          >
            Trabajador Independiente
          </button>
          <button
            style={tipo === 'empresa' ? botonActivo : botonInactivo}
            onClick={() => setTipo('empresa')}
          >
            Empresa
          </button>
        </div>

        {/* Grid de planes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px' }}>
          {planes.map((plan) => (
            <TarjetaPlan key={plan.nombre} plan={plan} />
          ))}
        </div>

        {/* Plan personalizado, siempre visible al final */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginTop: '25px' }}>
          <div style={{ gridColumn: '1 / 2' }}>
            <TarjetaPersonalizado />
          </div>
        </div>
      </main>
    </div>
  );
}