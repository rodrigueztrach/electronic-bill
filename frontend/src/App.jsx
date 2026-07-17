import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clientes from './pages/Clientes.jsx';
import Productos from './pages/Productos.jsx';
import FacturaForm from './pages/FacturaForm.jsx';
import FacturaList from './pages/FacturaList.jsx';

function RutaPrivada({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RutaPrivada><Dashboard /></RutaPrivada>} />
          <Route path="/clientes" element={<RutaPrivada><Clientes /></RutaPrivada>} />
          <Route path="/productos" element={<RutaPrivada><Productos /></RutaPrivada>} />
          <Route path="/facturas" element={<RutaPrivada><FacturaList /></RutaPrivada>} />
          <Route path="/facturas/nueva" element={<RutaPrivada><FacturaForm /></RutaPrivada>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
