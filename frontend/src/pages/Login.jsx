import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
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
