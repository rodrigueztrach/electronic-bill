import React, { useEffect, useState } from 'react';
import api from '../api/api';

const vacio = { nombre: '', email: '', password: '', rol: 'vendedor' };
const usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState('');

  async function cargar() {
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
  }

  useEffect(() => { cargar(); }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function editar(u) {
    setEditandoId(u.id);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setForm(vacio);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editandoId) {
        const payload = { nombre: form.nombre, rol: form.rol };
        if (form.password) payload.password = form.password;
        await api.put(`/usuarios/${editandoId}`, payload);
      } else {
        await api.post('/usuarios', form);
      }
      cancelarEdicion();
      cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el usuario');
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      cargar();
    } catch (err) {
      alert(err.response?.data?.error || 'No se pudo eliminar');
    }
  }

  return (
    <div>
      <h1>Usuarios</h1>
      <p>Solo los administradores pueden crear, editar o eliminar cuentas de vendedores.</p>

      <div className="card">
        <h3>{editandoId ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <form onSubmit={onSubmit} className="form-grid">
          <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={onChange} required />
          <input
            name="email" type="email" placeholder="Correo"
            value={form.email} onChange={onChange} required
            disabled={!!editandoId}
          />
          <input
            name="password" type="password"
            placeholder={editandoId ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            value={form.password} onChange={onChange}
            required={!editandoId}
          />
          <select name="rol" value={form.rol} onChange={onChange}>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Administrador</option>
          </select>

          {error && <p className="error">{error}</p>}
          <div>
            <button type="submit">{editandoId ? 'Guardar cambios' : 'Crear usuario'}</button>
            {editandoId && <button type="button" onClick={cancelarEdicion} style={{ marginLeft: 8, background: '#888' }}>Cancelar</button>}
          </div>
        </form>
      </div>

      <table className="tabla">
        <thead>
          <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th></th></tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nombre}</td>
              <td>{u.email}</td>
              <td><span className={`badge ${u.rol === 'admin' ? 'ok' : ''}`}>{u.rol}</span></td>
              <td>
                <button onClick={() => editar(u)}>Editar</button>{' '}
                {u.id !== usuarioActual?.id && (
                  <button onClick={() => eliminar(u.id)} style={{ background: '#c0392b' }}>Eliminar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}