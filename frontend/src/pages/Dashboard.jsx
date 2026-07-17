import React, { useEffect, useState } from 'react';
import api from '../api/api';

export default function Dashboard() {
  const [resumen, setResumen] = useState({ total: 0, aceptadas: 0, pendientes: 0, rechazadas: 0 });

  useEffect(() => {
    api.get('/facturas').then(({ data }) => {
      const total = data.length;
      const aceptadas = data.filter((f) => f.estado_hacienda === 'aceptado').length;
      const rechazadas = data.filter((f) => f.estado_hacienda === 'rechazado').length;
      const pendientes = total - aceptadas - rechazadas;
      setResumen({ total, aceptadas, pendientes, rechazadas });
    });
  }, []);

  return (
    <div>
      <h1>Panel de facturación</h1>
      <div className="grid-cards">
        <div className="stat-card"><h3>{resumen.total}</h3><p>Facturas emitidas</p></div>
        <div className="stat-card ok"><h3>{resumen.aceptadas}</h3><p>Aceptadas por Hacienda</p></div>
        <div className="stat-card warn"><h3>{resumen.pendientes}</h3><p>Pendientes / en proceso</p></div>
        <div className="stat-card error"><h3>{resumen.rechazadas}</h3><p>Rechazadas</p></div>
      </div>
    </div>
  );
}
