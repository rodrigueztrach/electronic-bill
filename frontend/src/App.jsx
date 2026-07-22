import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import RegistroEmpresa from './components/RegistroEmpresa.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clientes from './pages/Clientes.jsx';
import Productos from './pages/Productos.jsx';
import FacturaForm from './pages/FacturaForm.jsx';
import FacturaList from './pages/FacturaList.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Perfil from './pages/Perfil';
import HomePublica from './pages/HomePublica.jsx';
import Contacto from './pages/Contacto.jsx';
import Planes from './pages/Planes.jsx';

// Envuelve las rutas que llevan el Navbar privado del sistema
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
  return usuario?.rol === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- RUTAS PÚBLICAS (Muestran la barra superior pública) --- */}
        <Route path="/" element={<HomePublica />} />
        <Route path="/home" element={<HomePublica />} />
        <Route path="/servicios" element={<HomePublica />} />
        <Route path="/nosotros" element={<HomePublica />} />
        <Route path="/planes" element={<Planes />} />
        <Route path="/contacto" element={<Contacto />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegistroEmpresa />} />

        {/* --- RUTAS PRIVADAS (Requieren inicio de sesión y token) --- */}
        <Route path="/dashboard" element={<LayoutPrivado><Dashboard /></LayoutPrivado>} />
        <Route path="/clientes" element={<LayoutPrivado><Clientes /></LayoutPrivado>} />
        <Route path="/productos" element={<LayoutPrivado><Productos /></LayoutPrivado>} />
        <Route path="/facturas" element={<LayoutPrivado><FacturaList /></LayoutPrivado>} />
        <Route path="/facturas/nueva" element={<LayoutPrivado><FacturaForm /></LayoutPrivado>} />
        <Route path="/perfil" element={<LayoutPrivado><Perfil /></LayoutPrivado>} />

        {/* Ruta Admin protegida */}
        <Route path="/usuarios" element={
          <RutaAdmin>
            <LayoutPrivado>
              <Usuarios />
            </LayoutPrivado>
          </RutaAdmin>
        } />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}