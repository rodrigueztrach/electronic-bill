import React from 'react';
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
        <Link to="/planes" style={{ color: '#fff', textDecoration: 'none' }}>Planes</Link>
        <Link to="/registro" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Regístrese</Link>
        <Link to="/contacto" style={{ color: '#fff', textDecoration: 'none' }}>Contáctenos</Link>
      </nav>
    </header>
  );
}

export default function HomePublica() {
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* --- Barra de Navegación Superior --- */}
      <NavbarPublico />

      {/* --- Sección Principal: Servicios --- */}
      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#333', fontSize: '36px', marginBottom: '40px' }}>Servicios</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>

          {/* Tarjeta 1: Trabajador independiente */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#004080', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
              👤
            </div>
            <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '15px' }}>Trabajador independiente</h3>
            <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left' }}>
              A través del sitio web facturar.cr los trabajadores independientes podrán realizar sus facturas electrónicas, gestionar sus ventas, registrar sus productos y servicios y dar de alta a sus clientes entre otras funcionalidades.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left', marginTop: '15px' }}>
              Emita facturas en cualquier momento y desde cualquier dispositivo móvil de forma fácil y segura mediante nuestro sitio web.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left', marginTop: '15px' }}>
              No se requiere de instalaciones de ningún tipo en sus equipos para poder funcionar.
            </p>
          </div>

          {/* Tarjeta 2: Integrador empresarial */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#004080', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
              ⚙️
            </div>
            <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '15px' }}>Integrador empresarial</h3>
            <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left' }}>
              Si su empresa cuenta con un sistema de facturación ponemos a su disposición nuestra plataforma <strong>FE-CORE</strong> Empresarial.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left', marginTop: '10px' }}>
              Permítanos hacer por su empresa lo siguiente:
            </p>
            <ul style={{ fontSize: '14px', color: '#555', textAlign: 'left', paddingLeft: '20px', lineHeight: '1.5' }}>
              <li>Generar el documento electrónico</li>
              <li>Firmar digitalmente el documento electrónico.</li>
              <li>Gestionar ante el Ministerio de Hacienda el documento electrónico.</li>
              <li>Almacenar los documentos electrónicos y el acuse de recibido o rechazado.</li>
              <li>Enviar por email el documento electrónico al cliente (opcional)</li>
            </ul>
            <p style={{ fontSize: '13px', color: '#666', textAlign: 'left', marginTop: '15px', fontStyle: 'italic' }}>
              Una herramienta fácil de integrar y actualmente en producción.
            </p>
          </div>

          {/* Tarjeta 3: Solución completa */}
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', backgroundColor: '#004080', borderRadius: '50%', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px' }}>
              💻
            </div>
            <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '15px' }}>Solución completa</h3>
            <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left' }}>
              Si su empresa aún no cuenta con un sistema de facturación, tenemos opciones para su representada según el tipo de negocio, tamaño y necesidades.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left', marginTop: '15px' }}>
              Sistemas actualmente instalados y funcionando, con varios años en el mercado lo cual garantiza su madurez y estabilidad.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left', marginTop: '15px' }}>
              Sistemas multiusuario, multisucursal, multiempresa, para administrar desde un local hasta una cadena comercial, con módulos de inventarios, compras, facturación y contabilidad. Todo integrado.
            </p>
            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', textAlign: 'left', marginTop: '15px' }}>
              Consulte por nuestros planes de alquiler mensual de sistema de facturación más equipo de cómputo especial para punto de venta.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}