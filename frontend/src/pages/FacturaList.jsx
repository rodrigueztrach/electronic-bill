import React, { useEffect, useState } from 'react';
import api from '../api/api';

const etiquetaEstado = {
  pendiente: { texto: 'Pendiente', clase: 'warn' },
  recibido: { texto: 'Recibido por Hacienda', clase: 'warn' },
  procesando: { texto: 'Procesando', clase: 'warn' },
  aceptado: { texto: 'Aceptado', clase: 'ok' },
  rechazado: { texto: 'Rechazado', clase: 'error' },
  error_envio: { texto: 'Error de envío', clase: 'error' },
  error_firma: { texto: 'Error de firma', clase: 'error' },
};

export default function FacturaList() {
  const [facturas, setFacturas] = useState([]);

  async function cargar() {
    const { data } = await api.get('/facturas');
    setFacturas(data);
  }

  useEffect(() => { cargar(); }, []);

  async function consultarEstado(id) {
    await api.get(`/facturas/${id}/estado`);
    cargar();
  }

  return (
    <div>
      <h1>Facturas emitidas</h1>
      <table className="tabla">
        <thead>
          <tr>
            <th>Consecutivo</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f) => {
            const est = etiquetaEstado[f.estado_hacienda] || { texto: f.estado_hacienda, clase: '' };
            return (
              <tr key={f.id}>
                <td>{f.consecutivo}</td>
                <td>{f.Cliente?.nombre}</td>
                <td>{new Date(f.fecha_emision).toLocaleString('es-CR')}</td>
                <td>₡{Number(f.total_comprobante).toFixed(2)}</td>
                <td><span className={`badge ${est.clase}`}>{est.texto}</span></td>
                <td><button onClick={() => consultarEstado(f.id)}>Actualizar estado</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
