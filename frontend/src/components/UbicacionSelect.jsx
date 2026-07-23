import React, { useState, useEffect } from 'react';

export default function UbicacionSelect({ value, onChange }) {
  // value = { provincia, provincia_nombre, canton, canton_nombre, distrito, distrito_nombre }
  const [provincias, setProvincias] = useState([]);
  const [cantones, setCantones] = useState([]);
  const [distritos, setDistritos] = useState([]);

  useEffect(() => {
    fetch('https://ubicaciones.paginasweb.cr/provincias.json')
      .then((res) => res.json())
      .then((data) => setProvincias(Object.entries(data)));
  }, []);

  useEffect(() => {
    if (!value.provincia) { setCantones([]); return; }
    fetch(`https://ubicaciones.paginasweb.cr/provincia/${value.provincia}/cantones.json`)
      .then((res) => res.json())
      .then((data) => setCantones(Object.entries(data)));
  }, [value.provincia]);

  useEffect(() => {
    if (!value.provincia || !value.canton) { setDistritos([]); return; }
    fetch(`https://ubicaciones.paginasweb.cr/provincia/${value.provincia}/canton/${value.canton}/distritos.json`)
      .then((res) => res.json())
      .then((data) => setDistritos(Object.entries(data)));
  }, [value.provincia, value.canton]);

  function handleProvincia(e) {
    const codigo = e.target.value;
    const nombre = provincias.find(([id]) => id === codigo)?.[1] || '';
    onChange({
      provincia: codigo, provincia_nombre: nombre,
      canton: '', canton_nombre: '',
      distrito: '', distrito_nombre: '',
      barrio: '00', barrio_nombre: '',
    });
  }

  function handleCanton(e) {
    const codigo = e.target.value.padStart(2, '0');
    const nombre = cantones.find(([id]) => id === e.target.value)?.[1] || '';
    onChange({ ...value, canton: codigo, canton_nombre: nombre, distrito: '', distrito_nombre: '' });
  }

  function handleDistrito(e) {
    const codigo = e.target.value.padStart(2, '0');
    const nombre = distritos.find(([id]) => id === e.target.value)?.[1] || '';
    onChange({ ...value, distrito: codigo, distrito_nombre: nombre });
  }

  const selectStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div>
        <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Provincia</label>
        <select value={value.provincia} onChange={handleProvincia} required style={selectStyle}>
          <option value="">Seleccione...</option>
          {provincias.map(([id, nombre]) => (
            <option key={id} value={id}>{nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Cantón</label>
        <select value={parseInt(value.canton, 10) || ''} onChange={handleCanton} required disabled={!value.provincia} style={selectStyle}>
          <option value="">Seleccione...</option>
          {cantones.map(([id, nombre]) => (
            <option key={id} value={id}>{nombre}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '5px' }}>Distrito</label>
        <select value={parseInt(value.distrito, 10) || ''} onChange={handleDistrito} required disabled={!value.canton} style={selectStyle}>
          <option value="">Seleccione...</option>
          {distritos.map(([id, nombre]) => (
            <option key={id} value={id}>{nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}