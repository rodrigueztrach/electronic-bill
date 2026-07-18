import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const autenticado = !!localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const esAdmin = usuario?.rol === 'admin';

  function salir() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  }

  if (!autenticado) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">Facturación CR</div>
      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/facturas">Facturas</Link>
        <Link to="/facturas/nueva">Nueva Factura</Link>
        <Link to="/clientes">Clientes</Link>
        <Link to="/productos">Productos</Link>
        {esAdmin && <Link to="/usuarios">Usuarios</Link>}
        <Link to="/perfil">Mi perfil</Link> {/* 👈 NUEVA */}
        {usuario && <span className="navbar-user">{usuario.nombre} ({usuario.rol})</span>}
        <button onClick={salir}>Salir</button>
      </div>
    </nav>
  );
}