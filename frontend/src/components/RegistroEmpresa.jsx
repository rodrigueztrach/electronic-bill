import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

// Barra de navegación superior pública reutilizable
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
        <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Planes</Link>
        <Link to="/registro" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Regístrese</Link>
        <Link to="/contacto" style={{ color: '#fff', textDecoration: 'none' }}>Contáctenos</Link>
      </nav>
    </header>
  );
}

export default function RegistroEmpresa() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',            // Nombre del Independiente o Empresa (Razón Social)
    nombre_comercial: '',   // Nombre Comercial
    tipo_identificacion: '01', // 01 Física, 02 Jurídica, etc.
    identificacion: '',     // N° Identificación
    provincia: '',
    canton: '',
    distrito: '',
    barrio: '',
    senas_extra: '',        // Dirección Exacta
    email: '',              // Email para Hacienda
    email_copia: '',        // Email para Copia de Factura
    telefono: '',
    referencia: '',
    password: ''            // Necesario si vas a crear el usuario a la vez
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Endpoint público de registro (ej. /auth/register o /empresa/registro)
      const { data } = await api.post('/auth/register', formData);
      
      setSuccess('¡Registro completado con éxito! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el registro, verifica los datos.');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <NavbarPublico />
      
      <div className="card" style={{ maxWidth: 750, margin: '40px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>Información de Registro</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Nombre del Independiente o Empresa</label>
              <input 
                type="text" 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange} 
                placeholder="Nombre Completo (Razón Social)" 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Nombre Comercial</label>
              <input 
                type="text" 
                name="nombre_comercial" 
                value={formData.nombre_comercial} 
                onChange={handleChange} 
                placeholder="Nombre Comercial" 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Tipo de identificación</label>
              <select name="tipo_identificacion" value={formData.tipo_identificacion} onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                <option value="01">-- Seleccione un tipo --</option>
                <option value="01">01 - Cédula Física</option>
                <option value="02">02 - Cédula Jurídica</option>
                <option value="03">03 - DIMEX</option>
                <option value="04">04 - NITE</option>
                <option value="05">05 - Extranjero no domiciliado</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>N° Identificación</label>
              <input 
                type="text" 
                name="identificacion" 
                value={formData.identificacion} 
                onChange={handleChange} 
                placeholder="N° Identificación" 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Provincia</label>
              <input type="text" name="provincia" maxLength={1} value={formData.provincia} onChange={handleChange} placeholder="Provincia" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Cantón</label>
              <input type="text" name="canton" maxLength={2} value={formData.canton} onChange={handleChange} placeholder="Cantón" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Distrito</label>
              <input type="text" name="distrito" maxLength={2} value={formData.distrito} onChange={handleChange} placeholder="Distrito" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Barrio (Opcional)</label>
              <input type="text" name="barrio" maxLength={2} value={formData.barrio} onChange={handleChange} placeholder="Barrio (Opcional)" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Dirección Exacta</label>
            <textarea 
              name="senas_extra" 
              rows="3" 
              value={formData.senas_extra} 
              onChange={handleChange} 
              placeholder="Dirección Exacta"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Email para Hacienda</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Correo Electrónico" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Email para Copia de Factura</label>
              <input type="email" name="email_copia" value={formData.email_copia} onChange={handleChange} placeholder="Correo Electrónico" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Teléfono</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Referencia (Opcional)</label>
              <input type="text" name="referencia" value={formData.referencia} onChange={handleChange} placeholder="Referencia" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Contraseña de acceso</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña para el sistema" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
          </div>

          {error && <p className="error" style={{ color: 'red', marginTop: '10px', fontSize: '13px' }}>{error}</p>}
          {success && <p className="success" style={{ color: 'green', marginTop: '10px', fontSize: '13px' }}>{success}</p>}

          <button type="submit" style={{ marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#004080', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}