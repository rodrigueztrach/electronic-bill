import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Barra de navegación pública reutilizable para todas las pestañas públicas
// NOTA: se corrigió el enlace de "Planes", que antes apuntaba a "/login"
// (copiado de "Inicio" por error) y ahora apunta a "/planes".
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
        <Link to="/registro" style={{ color: '#fff', textDecoration: 'none' }}>Regístrese</Link>
        <Link to="/contacto" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Contáctenos</Link>
      </nav>
    </header>
  );
}

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tema: '',
    comentario: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí se conectaría con el backend / API de contacto
    console.log('Datos de contacto:', formData);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    color: '#333',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    color: '#333',
    marginBottom: '6px',
    marginTop: '18px',
    fontWeight: 'bold',
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>

      {/* --- Barra de Navegación Superior --- */}
      <NavbarPublico />

      {/* --- Sección Principal: Formulario de Contacto --- */}
      <main style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>

        {/* Encabezado azul con ícono de sobre */}
        <div style={{ backgroundColor: '#004080', padding: '25px 30px', borderRadius: '4px 4px 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '22px', color: '#fff' }}>✉️</span>
          <h1 style={{ color: '#fff', fontSize: '24px', margin: 0, fontWeight: 'bold' }}>Contáctenos</h1>
        </div>

        {/* Cuerpo del formulario */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#f5f5f5', padding: '30px', borderRadius: '0 0 4px 4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>

          <label style={{ ...labelStyle, marginTop: 0 }}>Nombre</label>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <label style={labelStyle}>Correo Electrónico</label>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <label style={labelStyle}>Teléfono</label>
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <label style={labelStyle}>Tema</label>
          <select
            name="tema"
            value={formData.tema}
            onChange={handleChange}
            style={inputStyle}
            required
          >
            <option value="">Seleccione una opción</option>
            <option value="soporte">Soporte técnico</option>
            <option value="ventas">Ventas</option>
            <option value="facturacion">Facturación</option>
            <option value="otro">Otro</option>
          </select>

          <label style={labelStyle}>Comentario</label>
          <textarea
            name="comentario"
            placeholder="Comentario"
            value={formData.comentario}
            onChange={handleChange}
            rows={6}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'Arial, sans-serif' }}
            required
          />

          <div style={{ textAlign: 'right', marginTop: '25px' }}>
            <button
              type="submit"
              style={{
                backgroundColor: '#5b9bd5',
                color: '#fff',
                border: 'none',
                padding: '10px 30px',
                borderRadius: '4px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Enviar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}