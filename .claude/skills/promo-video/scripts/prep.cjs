// Completa la agenda de "hoy" en la BD local de demostración para la grabación.
const API = process.env.PROMO_API_URL || 'http://localhost:3000/api';
(async () => {
  const login = await (await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ usernameOrEmail: 'admin', password: 'demo1234' }) })).json();
  const h = { 'content-type': 'application/json', authorization: `Bearer ${login.data.token}` };
  const get = async (r) => (await (await fetch(`${API}/${r}`, { headers: h })).json()).data;
  const [pacientes, medicos, citas] = await Promise.all([get('pacientes'), get('medicos'), get('citas')]);
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const pac = (n) => pacientes.find((p) => p.nombre.startsWith(n)).id;
  const med = (n) => medicos.find((m) => m.nombre.includes(n)).id;
  // La cita de las 08:00 ya fue atendida
  for (const c of citas.filter((c) => c.fecha === today && c.hora.startsWith('08'))) {
    await fetch(`${API}/citas/${c.id}`, { method: 'PUT', headers: h, body: JSON.stringify({ ...c, estado: 'completada' }) });
  }
  const nuevas = [
    { pacienteId: pac('Juan'), medicoId: med('Mendoza'), hora: '09:00', motivo: 'Control de presión arterial', estado: 'completada' },
    { pacienteId: pac('Sofía'), medicoId: med('Torres'), hora: '10:00', motivo: 'Vacunación', estado: 'completada' },
    { pacienteId: pac('Lucía'), medicoId: med('Jara'), hora: '12:00', motivo: 'Chequeo anual' },
    { pacienteId: pac('Marcos'), medicoId: med('Luna'), hora: '14:30', motivo: 'Revisión dermatológica' },
  ];
  for (const n of nuevas) {
    const r = await fetch(`${API}/citas`, { method: 'POST', headers: h, body: JSON.stringify({ fecha: today, estado: 'programada', ...n }) });
    const d = await r.json(); if (!r.ok) console.log('error', d.message);
    if (n.estado === 'completada') await fetch(`${API}/citas/${d.data.id}`, { method: 'PUT', headers: h, body: JSON.stringify({ ...d.data, estado: 'completada' }) });
  }
  const hoy = (await get('citas')).filter((c) => c.fecha === today).map((c) => `${c.hora} ${c.estado}`).sort();
  console.log('agenda de hoy:', hoy.join(' | '));
})();
