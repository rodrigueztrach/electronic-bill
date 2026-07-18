import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // --- NUEVO: estado para el paso de MFA ---
  const [mfaRequired, setMfaRequired] = useState(false);
  const [userId, setUserId] = useState(null);
  const [codigo, setCodigo] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });

      // --- NUEVO: si el backend pide MFA, no guardamos token todavía ---
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

  // --- NUEVO: envío del código de 6 dígitos ---
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

  // --- NUEVO: pantalla del segundo paso ---
  if (mfaRequired) {
    return (
      <div className="card" style={{ maxWidth: 380, margin: '60px auto' }}>
        <h2>Verificación en dos pasos</h2>
        <p>Ingresa el código de 6 dígitos de tu app de autenticación.</p>
        <form onSubmit={handleMfaSubmit}>
          <label>Código</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Verificar</button>
        </form>
        <button
          type="button"
          onClick={() => { setMfaRequired(false); setCodigo(''); setError(''); }}
          style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 380, margin: '60px auto' }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <label>Correo electrónico</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}