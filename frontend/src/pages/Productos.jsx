import React, { useEffect, useState } from 'react';
import api from '../api/api';
import CabysAutocomplete from '../components/CabysAutocomplete';

const vacio = {
  codigo_cabys: '', codigo_interno: '', descripcion: '', unidad_medida: 'Unid',
  precio_unitario: '', porcentaje_iva: 13, es_exento: false,
};

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState(vacio);
  const [claveReset, setClaveReset] = useState(0); // fuerza remount del autocompletar tras guardar

  async function cargar() {
    const { data } = await api.get('/productos');
    setProductos(data);
  }

  useEffect(() => { cargar(); }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  /** Se llama cuando el usuario elige un resultado del buscador CABYS. */
  function onSeleccionarCabys(item) {
    setForm((f) => ({
      ...f,
      codigo_cabys: item.codigo,
      descripcion: item.descripcion,
      porcentaje_iva: item.es_exento ? 0 : item.porcentaje_iva,
      es_exento: item.es_exento,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.codigo_cabys) {
      alert('Selecciona un código CABYS de la lista antes de guardar');
      return;
    }
    await api.post('/productos', form);
    setForm(vacio);
    setClaveReset((k) => k + 1);
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
          <div style={{ gridColumn: '1 / -1' }}>
            <label>Buscar en el catálogo CABYS</label>
            <CabysAutocomplete key={claveReset} onSeleccionar={onSeleccionarCabys} />
          </div>

          {form.codigo_cabys && (
            <div className="cabys-seleccionado" style={{ gridColumn: '1 / -1' }}>
              Código CABYS: <strong>{form.codigo_cabys}</strong> — {form.descripcion} (
              {form.es_exento ? 'Exento' : `${form.porcentaje_iva}% IVA`})
            </div>
          )}

          <input name="codigo_interno" placeholder="Código interno (opcional)" value={form.codigo_interno} onChange={onChange} />
          <input name="unidad_medida" placeholder="Unidad de medida" value={form.unidad_medida} onChange={onChange} />
          <input name="precio_unitario" type="number" step="0.00001" placeholder="Precio unitario" value={form.precio_unitario} onChange={onChange} required />

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