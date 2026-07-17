import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const autenticado = !!localStorage.getItem('token');

  function salir() {
    localStorage.removeItem('token');
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
        <button onClick={salir}>Salir</button>
      </div>
    </nav>
  );
}
