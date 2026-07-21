import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{
      backgroundColor: '#0b3d91',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 40px',
      width: '100%',
      boxSizing: 'border-box',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Lado izquierdo: Logo / Marca */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#fff' }}>
          Facturación CR
        </span>
      </div>

      {/* Lado derecho: Enlaces de navegación */}
      <div style={{ display: 'flex', gap: '25px', fontSize: '0.95rem', alignItems: 'center' }}>
        <Link to="/home" style={{ color: '#fff', textDecoration: 'none' }}>Inicio</Link>
        <Link to="/nosotros" style={{ color: '#fff', textDecoration: 'none' }}>Nosotros</Link>
        <Link to="/servicios" style={{ color: '#fff', textDecoration: 'none' }}>Servicios</Link>
        <Link to="/planes" style={{ color: '#fff', textDecoration: 'none' }}>Planes</Link>
        <Link to="/registro" style={{ color: '#fff', textDecoration: 'none' }}>Regístrese</Link>
        <Link to="/contacto" style={{ color: '#fff', textDecoration: 'none' }}>Contáctenos</Link>
      </div>
    </nav>
  );
}