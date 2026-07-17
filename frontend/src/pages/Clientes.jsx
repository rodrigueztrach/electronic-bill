import React, { useEffect, useState } from 'react';
import api from '../api/api';

const vacio = {
  tipo_identificacion: '01', identificacion: '', nombre: '', email: '', telefono: '',
  provincia: '', canton: '', distrito: '', barrio: '', senas_extra: '',
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(vacio);

  async function cargar() {
    const { data } = await api.get('/clientes');
    setClientes(data);
  }

  useEffect(() => { cargar(); }, []);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post('/clientes', form);
    setForm(vacio);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar cliente?')) return;
    await api.delete(`/clientes/${id}`);
    cargar();
  }

  return (
    <div>
      <h1>Clientes</h1>
      <div className="card">
        <h3>Nuevo cliente</h3>
        <form onSubmit={onSubmit} className="form-grid">
          <select name="tipo_identificacion" value={form.tipo_identificacion} onChange={onChange}>
            <option value="01">Física (01)</option>
            <option value="02">Jurídica (02)</option>
            <option value="03">DIMEX (03)</option>
            <option value="04">NITE (04)</option>
            <option value="05">Extranjero (05)</option>
          </select>
          <input name="identificacion" placeholder="Identificación" value={form.identificacion} onChange={onChange} required />
          <input name="nombre" placeholder="Nombre completo" value={form.nombre} onChange={onChange} required />
          <input name="email" placeholder="Correo" value={form.email} onChange={onChange} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={onChange} />
          <input name="provincia" placeholder="Provincia (1 dígito)" value={form.provincia} onChange={onChange} />
          <input name="canton" placeholder="Cantón (2 dígitos)" value={form.canton} onChange={onChange} />
          <input name="distrito" placeholder="Distrito (2 dígitos)" value={form.distrito} onChange={onChange} />
          <input name="senas_extra" placeholder="Señas exactas" value={form.senas_extra} onChange={onChange} />
          <button type="submit">Guardar cliente</button>
        </form>
      </div>

      <table className="tabla">
        <thead>
          <tr><th>Nombre</th><th>Identificación</th><th>Correo</th><th></th></tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nombre}</td>
              <td>{c.tipo_identificacion} - {c.identificacion}</td>
              <td>{c.email}</td>
              <td><button onClick={() => eliminar(c.id)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
