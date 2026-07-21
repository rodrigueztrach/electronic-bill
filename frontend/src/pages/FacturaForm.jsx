import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const TIPO_CAMBIO_CRC_USD_DEFAULT = 1;

export default function FacturaForm() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [condicionVenta, setCondicionVenta] = useState('01');
  const [medioPago, setMedioPago] = useState('01');
  const [plazoCredito, setPlazoCredito] = useState('');
  const [moneda, setMoneda] = useState('CRC');
  const [tipoCambio, setTipoCambio] = useState(TIPO_CAMBIO_CRC_USD_DEFAULT);
  const [lineas, setLineas] = useState([{ producto_id: '', cantidad: 1, monto_descuento: 0 }]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/clientes').then(({ data }) => setClientes(data));
    api.get('/productos').then(({ data }) => setProductos(data));
  }, []);

  function actualizarLinea(i, campo, valor) {
    setLineas(lineas.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));
  }

  function agregarLinea() {
    setLineas([...lineas, { producto_id: '', cantidad: 1, monto_descuento: 0 }]);
  }

  function quitarLinea(i) {
    setLineas(lineas.filter((_, idx) => idx !== i));
  }

  function calcularLinea(l) {
    const producto = productos.find((p) => p.id === l.producto_id);
    if (!producto) return { subtotal: 0, iva: 0, total: 0, unidad: '' };
    const subtotal = l.cantidad * producto.precio_unitario - (l.monto_descuento || 0);
    const iva = producto.es_exento ? 0 : subtotal * (producto.porcentaje_iva / 100);
    return {
      subtotal,
      iva,
      total: subtotal + iva,
      unidad: producto.unidad_medida || '—',
    };
  }

  function calcularTotalEstimado() {
    return lineas.reduce((acc, l) => acc + calcularLinea(l).total, 0);
  }

  // Reinicia el plazo de crédito si el usuario cambia de "crédito" a "contado",
  // para no enviar un valor viejo que ya no aplica.
  function onChangeCondicionVenta(valor) {
    setCondicionVenta(valor);
    if (valor !== '02') setPlazoCredito('');
  }

  // Reinicia el tipo de cambio a 1 si vuelve a CRC.
  function onChangeMoneda(valor) {
    setMoneda(valor);
    if (valor === 'CRC') setTipoCambio(1);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!clienteId) return setError('Selecciona un cliente');
    if (lineas.some((l) => !l.producto_id)) return setError('Selecciona un producto en cada línea');
    if (condicionVenta === '02' && !plazoCredito) {
      return setError('Indica el plazo de crédito en días');
    }
    if (moneda !== 'CRC' && (!tipoCambio || Number(tipoCambio) <= 0)) {
      return setError('Indica un tipo de cambio válido');
    }

    setEnviando(true);
    try {
      await api.post('/facturas', {
        cliente_id: clienteId,
        condicion_venta: condicionVenta,
        medio_pago: medioPago,
        plazo_credito: condicionVenta === '02' ? Number(plazoCredito) : null,
        moneda,
        tipo_cambio: moneda !== 'CRC' ? Number(tipoCambio) : 1,
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
            <select value={condicionVenta} onChange={(e) => onChangeCondicionVenta(e.target.value)}>
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

        {condicionVenta === '02' && (
          <div>
            <label>Plazo de crédito (días)</label>
            <input
              type="number" min="1" step="1" placeholder="Ej. 30"
              value={plazoCredito}
              onChange={(e) => setPlazoCredito(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-row">
          <div>
            <label>Moneda</label>
            <select value={moneda} onChange={(e) => onChangeMoneda(e.target.value)}>
              <option value="CRC">Colones (CRC)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
          {moneda !== 'CRC' && (
            <div>
              <label>Tipo de cambio del día</label>
              <input
                type="number" min="0.01" step="0.01"
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <h3>Líneas de detalle</h3>
        {lineas.map((linea, i) => {
          const { subtotal, iva, total, unidad } = calcularLinea(linea);
          return (
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
              <span className="unidad-medida">{unidad}</span>
              <span className="desglose">
                Subt: ₡{subtotal.toFixed(2)} · IVA: ₡{iva.toFixed(2)} · Total: ₡{total.toFixed(2)}
              </span>
              {lineas.length > 1 && <button type="button" onClick={() => quitarLinea(i)}>✕</button>}
            </div>
          );
        })}
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