import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Barra de navegación privada del sistema (aparece en todas las páginas internas)
export default function Navbar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  return (
    <header style={{ backgroundColor: '#004080', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '35px', height: '35px', backgroundColor: '#fff', borderRadius: '50%' }}></div>
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Facturación CR</span>
      </div>
      <nav style={{ display: 'flex', gap: '25px', fontSize: '15px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/clientes" style={{ color: '#fff', textDecoration: 'none' }}>Clientes</Link>
        <Link to="/productos" style={{ color: '#fff', textDecoration: 'none' }}>Productos</Link>
        <Link to="/facturas" style={{ color: '#fff', textDecoration: 'none' }}>Facturas</Link>
        <Link to="/facturas/nueva" style={{ color: '#fff', textDecoration: 'none' }}>Nueva Factura</Link>
        <Link to="/perfil" style={{ color: '#fff', textDecoration: 'none' }}>Perfil</Link>
        {usuario?.rol === 'admin' && (
          <Link to="/usuarios" style={{ color: '#fff', textDecoration: 'none' }}>Usuarios</Link>
        )}
        <button
          onClick={handleLogout}
          style={{ backgroundColor: 'transparent', color: '#fff', border: '1px solid #fff', borderRadius: '4px', padding: '6px 14px', cursor: 'pointer', fontSize: '14px' }}
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}