import React, { useEffect, useState } from 'react';
import api from '../api/api';

const vacio = {
  codigo_cabys: '', codigo_interno: '', descripcion: '', unidad_medida: 'Unid',
  precio_unitario: '', porcentaje_iva: 13, es_exento: false,
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);

  async function cargar() {
    const { data } = await api.get('/productos');
    setProductos(data);
  }

  useEffect(() => { cargar(); }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    await api.post('/productos', form);
    setForm(vacio);
    cargar();
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar producto?')) return;
    await api.delete(`/productos/${id}`);
    cargar();
  }

  return (
    <div>
      <h1>Productos / Servicios</h1>
      <div className="card">
        <h3>Nuevo producto</h3>
        <form onSubmit={onSubmit} className="form-grid">
          <input name="codigo_cabys" placeholder="Código CAByS (13 dígitos)" value={form.codigo_cabys} onChange={onChange} required maxLength={13} />
          <input name="codigo_interno" placeholder="Código interno (opcional)" value={form.codigo_interno} onChange={onChange} />
          <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={onChange} required />
          <input name="unidad_medida" placeholder="Unidad de medida" value={form.unidad_medida} onChange={onChange} />
          <input name="precio_unitario" type="number" step="0.00001" placeholder="Precio unitario" value={form.precio_unitario} onChange={onChange} required />
          <select name="porcentaje_iva" value={form.porcentaje_iva} onChange={onChange}>
            <option value="13">13% (tarifa general)</option>
            <option value="8">8%</option>
            <option value="4">4%</option>
            <option value="2">2%</option>
            <option value="1">1%</option>
            <option value="0">0% / Exento</option>
          </select>
          <label className="checkbox-inline">
            <input type="checkbox" name="es_exento" checked={form.es_exento} onChange={onChange} />
            Exento de IVA
          </label>
          <button type="submit">Guardar producto</button>
        </form>
      </div>

      <table className="tabla">
        <thead>
          <tr><th>Descripción</th><th>CAByS</th><th>Precio</th><th>IVA</th><th></th></tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.id}>
              <td>{p.descripcion}</td>
              <td>{p.codigo_cabys}</td>
              <td>₡{Number(p.precio_unitario).toFixed(2)}</td>
              <td>{p.es_exento ? 'Exento' : `${p.porcentaje_iva}%`}</td>
              <td><button onClick={() => eliminar(p.id)}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
