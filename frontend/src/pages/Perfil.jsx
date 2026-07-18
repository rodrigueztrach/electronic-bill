import React, { useState } from 'react';
import api from '../api/api';

const usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

export default function Perfil() {
  const [paso, setPaso] = useState('inicio'); // 'inicio' | 'escanear' | 'listo'
  const [qrImageUrl, setQrImageUrl] = useState(null);
  const [manualKey, setManualKey] = useState('');
  const [codigo, setCodigo] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');

  async function iniciarActivacion() {
    setError('');
    try {
      const { data } = await api.post('/auth/mfa/setup');
      setQrImageUrl(data.qrImageUrl);
      setManualKey(data.manualEntryKey);
      setPaso('escanear');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo iniciar la activación');
    }
  }

  async function confirmarActivacion(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/mfa/verify-setup', { token: codigo });
      setBackupCodes(data.backupCodes);
      setPaso('listo');
    } catch (err) {
      setError(err.response?.data?.error || 'Código incorrecto');
    }
  }

  return (
    <div>
      <h1>Mi perfil</h1>

      <div className="card" style={{ maxWidth: 420, marginBottom: 24 }}>
        <h3>Datos de la cuenta</h3>
        <p><strong>Nombre:</strong> {usuarioActual?.nombre}</p>
        <p><strong>Correo:</strong> {usuarioActual?.email}</p>
        <p><strong>Rol:</strong> {usuarioActual?.rol}</p>
      </div>

      <div className="card" style={{ maxWidth: 420 }}>
        <h3>Verificación en dos pasos (MFA)</h3>

        {paso === 'inicio' && (
          <>
            <p>Agrega una capa extra de seguridad pidiendo un código además de tu contraseña al iniciar sesión.</p>
            {error && <p className="error">{error}</p>}
            <button onClick={iniciarActivacion}>Activar MFA</button>
          </>
        )}

        {paso === 'escanear' && (
          <form onSubmit={confirmarActivacion}>
            <p>Escanea este código con Google Authenticator, Authy o Microsoft Authenticator.</p>

            {qrImageUrl && (
              <img
                src={qrImageUrl}
                alt="Código QR para configurar MFA"
                style={{ display: 'block', margin: '16px auto', width: 180, height: 180 }}
              />
            )}

            <details style={{ marginBottom: 12, fontSize: 14 }}>
              <summary style={{ cursor: 'pointer' }}>¿No puedes escanear? Ingresa la clave manualmente</summary>
              <code style={{ display: 'block', marginTop: 8, wordBreak: 'break-all' }}>{manualKey}</code>
            </details>

            <label>Código de verificación</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              required
            />

            {error && <p className="error">{error}</p>}

            <div>
              <button type="submit">Confirmar y activar</button>
              <button
                type="button"
                onClick={() => { setPaso('inicio'); setCodigo(''); setError(''); }}
                style={{ marginLeft: 8, background: '#888' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {paso === 'listo' && (
          <>
            <p className="error" style={{ color: '#2e7d32' }}>MFA activado correctamente.</p>
            <p>
              Guarda estos códigos de respaldo en un lugar seguro. Cada uno funciona una sola vez
              si pierdes acceso a tu app de autenticación. No volverán a mostrarse.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 6,
                fontFamily: 'monospace',
              }}
            >
              {backupCodes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}