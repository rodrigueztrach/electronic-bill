import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function FacturaForm() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [condicionVenta, setCondicionVenta] = useState('01');
  const [medioPago, setMedioPago] = useState('01');
  const [lineas, setLineas] = useState([{ producto_id: '', cantidad: 1, monto_descuento: 0 }]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/clientes').then(({ data }) => setClientes(data));
    api.get('/productos').then(({ data }) => setProductos(data));
  }, []);

  function actualizarLinea(i, campo, valor) {
    const nuevas = [...lineas];
    nuevas[i][campo] = valor;
    setLineas(nuevas);
  }

  function agregarLinea() {
    setLineas([...lineas, { producto_id: '', cantidad: 1, monto_descuento: 0 }]);
  }

  function quitarLinea(i) {
    setLineas(lineas.filter((_, idx) => idx !== i));
  }

  function calcularTotalEstimado() {
    return lineas.reduce((acc, l) => {
      const producto = productos.find((p) => p.id === l.producto_id);
      if (!producto) return acc;
      const subtotal = l.cantidad * producto.precio_unitario - (l.monto_descuento || 0);
      const iva = producto.es_exento ? 0 : subtotal * (producto.porcentaje_iva / 100);
      return acc + subtotal + iva;
    }, 0);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!clienteId) return setError('Selecciona un cliente');
    if (lineas.some((l) => !l.producto_id)) return setError('Selecciona un producto en cada línea');

    setEnviando(true);
    try {
      await api.post('/facturas', {
        cliente_id: clienteId,
        condicion_venta: condicionVenta,
        medio_pago: medioPago,
        lineas,
      });
      navigate('/facturas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la factura');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h1>Nueva factura electrónica</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Cliente</label>
        <select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
          <option value="">-- Selecciona --</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} ({c.identificacion})</option>
          ))}
        </select>

        <div className="form-row">
          <div>
            <label>Condición de venta</label>
            <select value={condicionVenta} onChange={(e) => setCondicionVenta(e.target.value)}>
              <option value="01">Contado</option>
              <option value="02">Crédito</option>
            </select>
          </div>
          <div>
            <label>Medio de pago</label>
            <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
              <option value="01">Efectivo</option>
              <option value="02">Tarjeta</option>
              <option value="03">Cheque</option>
              <option value="04">Transferencia</option>
            </select>
          </div>
        </div>

        <h3>Líneas de detalle</h3>
        {lineas.map((linea, i) => (
          <div key={i} className="linea-detalle">
            <select value={linea.producto_id} onChange={(e) => actualizarLinea(i, 'producto_id', e.target.value)} required>
              <option value="">Producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.descripcion} - ₡{Number(p.precio_unitario).toFixed(2)}</option>
              ))}
            </select>
            <input
              type="number" min="0.001" step="0.001" placeholder="Cantidad"
              value={linea.cantidad}
              onChange={(e) => actualizarLinea(i, 'cantidad', Number(e.target.value))}
            />
            <input
              type="number" min="0" step="0.01" placeholder="Descuento"
              value={linea.monto_descuento}
              onChange={(e) => actualizarLinea(i, 'monto_descuento', Number(e.target.value))}
            />
            {lineas.length > 1 && <button type="button" onClick={() => quitarLinea(i)}>✕</button>}
          </div>
        ))}
        <button type="button" onClick={agregarLinea}>+ Agregar línea</button>

        <h3>Total estimado: ₡{calcularTotalEstimado().toFixed(2)}</h3>

        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando a Hacienda...' : 'Emitir factura'}
        </button>
      </form>
    </div>
  );
}
