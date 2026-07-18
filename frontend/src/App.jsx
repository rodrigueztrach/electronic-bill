import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clientes from './pages/Clientes.jsx';
import Productos from './pages/Productos.jsx';
import FacturaForm from './pages/FacturaForm.jsx';
import FacturaList from './pages/FacturaList.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Perfil from './pages/Perfil';

// Envuelve las rutas que sí llevan diseño común (Navbar)
function LayoutPrivado({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <div className="container">
        {children}
      </div>
    </>
  );
}

function RutaAdmin({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  return usuario?.rol === 'admin' ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública pura (sin Navbar) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas con Navbar integrado */}
        <Route path="/" element={<LayoutPrivado><Dashboard /></LayoutPrivado>} />
        <Route path="/clientes" element={<LayoutPrivado><Clientes /></LayoutPrivado>} />
        <Route path="/productos" element={<LayoutPrivado><Productos /></LayoutPrivado>} />
        <Route path="/facturas" element={<LayoutPrivado><FacturaList /></LayoutPrivado>} />
        <Route path="/facturas/nueva" element={<LayoutPrivado><FacturaForm /></LayoutPrivado>} />
        <Route path="/perfil" element={<LayoutPrivado><Perfil /></LayoutPrivado>} />

        {/* Ruta Admin protegida doblemente */}
        <Route path="/usuarios" element={
          <RutaAdmin>
            <LayoutPrivado>
              <Usuarios />
            </LayoutPrivado>
          </RutaAdmin>
        } />

        {/* Redirección por si escriben cualquier otra ruta errónea */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
