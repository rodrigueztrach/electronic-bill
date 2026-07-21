import React, { useEffect, useRef, useState } from 'react';
import api from '../api/api';

export default function CabysAutocomplete({ onSeleccionar, valorInicial = '' }) {
  const [texto, setTexto] = useState(valorInicial);
  const [resultados, setResultados] = useState([]);
  const [mostrando, setMostrando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const timeoutRef = useRef(null);
  const seleccionActivaRef = useRef(false); // evita re-buscar tras elegir un resultado

  useEffect(() => {
    // Si el cambio de texto vino de una selección (no de que el usuario escriba),
    // no dispares una nueva búsqueda.
    if (seleccionActivaRef.current) {
      seleccionActivaRef.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (texto.trim().length < 3) {
      setResultados([]);
      return;
    }

    setCargando(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/cabys/buscar', { params: { q: texto.trim() } });
        setResultados(data);
        setMostrando(true);
      } catch {
        setResultados([]);
      } finally {
        setCargando(false);
      }
    }, 350);

    return () => clearTimeout(timeoutRef.current);
  }, [texto]);

  function onChangeTexto(valor) {
    setTexto(valor);
  }

  function elegir(item) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current); // cancela cualquier búsqueda pendiente
    seleccionActivaRef.current = true; // avisa al effect que este cambio de texto no debe re-buscar
    setTexto(`${item.descripcion} (${item.codigo})`);
    setMostrando(false);
    setResultados([]);
    onSeleccionar(item);
  }

  return (
    <div className="cabys-autocomplete">
      <input
        type="text"
        placeholder="Busca por descripción o código CABYS..."
        value={texto}
        onChange={(e) => onChangeTexto(e.target.value)}
        onFocus={() => resultados.length > 0 && setMostrando(true)}
        onBlur={() => setTimeout(() => setMostrando(false), 150)}
      />
      {cargando && <div className="cabys-loading">Buscando...</div>}
      {mostrando && resultados.length > 0 && (
        <ul className="cabys-resultados">
          {resultados.map((r) => (
            <li key={r.codigo} onMouseDown={() => elegir(r)}>
              <strong>{r.codigo}</strong> — {r.descripcion}
              <span className="cabys-iva">{r.es_exento ? 'Exento' : `${r.porcentaje_iva}% IVA`}</span>
            </li>
          ))}
        </ul>
      )}
      {mostrando && !cargando && resultados.length === 0 && texto.trim().length >= 3 && (
        <ul className="cabys-resultados">
          <li className="cabys-sin-resultados">Sin coincidencias. Prueba con otro término.</li>
        </ul>
      )}
    </div>
  );
}