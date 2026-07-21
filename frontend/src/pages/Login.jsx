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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- Estado para el paso de MFA ---
  const [mfaRequired, setMfaRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [codigo, setCodigo] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // --- Si el backend pide MFA, no guardamos token todavía ---
      if (data.mfaRequired) {
        setUserId(data.userId);
        setMfaRequired(true);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión, por favor inténtalo de nuevo.');
    }
  }

  // --- Envío del código de 6 dígitos ---
  async function handleMfaSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/mfa/login', { userId, token: codigo });
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto, intenta de nuevo.');
    }
  }

  // --- Pantalla del segundo paso (MFA) con la barra superior ---
  if (mfaRequired) {
    return (
      <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <NavbarPublico />
        <div className="card" style={{ maxWidth: 380, margin: '60px auto', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Verificación en dos pasos</h2>
          <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px' }}>Ingresa el código de 6 dígitos de tu app de autenticación.</p>
          <form onSubmit={handleMfaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ fontSize: '14px', color: '#555' }}>Código</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
            {error && <p className="error" style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
            <button type="submit" style={{ backgroundColor: '#004080', color: '#fff', padding: '10px', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Verificar</button>
          </form>
          <button
            type="button"
            onClick={() => { setMfaRequired(false); setCodigo(''); setError(''); }}
            style={{ marginTop: '15px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: '#004080' }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // --- Pantalla principal de Login con la barra superior ---
  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <NavbarPublico />
      <div className="card" style={{ maxWidth: 380, margin: '60px auto', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '25px' }}>Iniciar sesión</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Correo electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
          {error && <p className="error" style={{ color: 'red', fontSize: '13px', margin: 0 }}>{error}</p>}
          <button 
            type="submit" 
            style={{ backgroundColor: '#004080', color: '#fff', padding: '12px', borderRadius: '4px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            Entrar
          </button>
        </form>

        {/* --- Enlace para navegar a la página de registro --- */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" style={{ color: '#004080', textDecoration: 'underline', fontWeight: 'bold' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}