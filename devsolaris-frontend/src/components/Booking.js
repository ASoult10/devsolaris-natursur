import React, { useEffect, useState } from 'react';

/*
 Booking:
 - muestra selector de fecha y franjas horarias (09:00-17:00 por defecto)
 - consulta booked appointments en /api/appointments?startDate=...&endDate=...
 - crea cita con POST /api/appointments { userId, title, description, startDate, endDate, location }
 - requiere token (user.token); si no hay user llama onRequireLogin()
 - al reservar dispatchEvent('appointmentBooked', { appointment })
*/

function useApi(user) {
  const token = user?.token;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  async function get(path) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...authHeader } });
    const text = await res.text().catch(() => '');
    if (!res.ok) throw new Error(text || `${res.status} ${res.statusText}`);
    try { return JSON.parse(text || 'null'); } catch { throw new Error('Respuesta no JSON'); }
  }
  async function post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(body),
    });
    const text = await res.text().catch(() => '');
    if (!(res.status === 200 || res.status === 201)) {
      throw new Error(text || `${res.status} ${res.statusText}`);
    }
    try { return JSON.parse(text || 'null'); } catch { return null; }
  }
  return { get, post };
}

function buildDaySlots(dateStr, startHour = 9, endHour = 17, slotMinutes = 60) {
  const slots = [];
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);
  for (let h = startHour; h < endHour; h++) {
    const s = new Date(date);
    s.setHours(h, 0, 0, 0);
    const e = new Date(s);
    e.setMinutes(e.getMinutes() + slotMinutes);
    slots.push({ start: s.toISOString(), end: e.toISOString(), label: `${String(h).padStart(2,'0')}:00 - ${String(h+1).padStart(2,'0')}:00` });
  }
  return slots;
}

export default function Booking({ user, onRequireLogin }) {
  const [date, setDate] = useState(() => {
    const d = new Date(); return d.toISOString().slice(0,10);
  });
  const [slots, setSlots] = useState([]);
  const [booked, setBooked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const api = useApi(user);

  async function loadBooked() {
    setMsg(null);
    setLoading(true);
    try {
      // Pedimos todas las citas del día: start 00:00 end 23:59
      const startDate = new Date(date); startDate.setHours(0,0,0,0);
      const endDate = new Date(date); endDate.setHours(23,59,59,999);
      const qs = `?startDate=${encodeURIComponent(startDate.toISOString())}&endDate=${encodeURIComponent(endDate.toISOString())}`;
      const data = await api.get(`/api/appointments${qs}`);
      setBooked(Array.isArray(data) ? data : []);
      // calcular slots y filtrar
      const all = buildDaySlots(date);
      const available = all.filter(s => {
        // si existe booked appointment con startTime === s.start (o que se solape) la quitamos
        return !bookedOverlap(s, data || []);
      });
      // recompute with fresh booked data
      const available2 = all.filter(s => !bookedOverlap(s, data || []));
      setSlots(available2);
    } catch (e) {
      setMsg('Error cargando horas: ' + e.message);
      // fallback: mostrar todos los slots
      setSlots(buildDaySlots(date));
      setBooked([]);
    } finally {
      setLoading(false);
    }
  }

  // helper para comprobar solapamiento (simple igualdad o overlap)
  function bookedOverlap(slot, bookedArr) {
    if (!Array.isArray(bookedArr)) return false;
    const s1 = new Date(slot.start).getTime();
    const e1 = new Date(slot.end).getTime();
    return bookedArr.some(b => {
      const bs = b.startTime ? new Date(b.startTime).getTime() : (b.startDate ? new Date(b.startDate).getTime() : 0);
      const be = b.endTime ? new Date(b.endTime).getTime() : (b.endDate ? new Date(b.endDate).getTime() : 0);
      // si bs/be no válidos, no consideramos
      if (!bs || !be) return false;
      return Math.max(s1, bs) < Math.min(e1, be); // overlap
    });
  }

  useEffect(() => {
    // recarga cuando cambia la fecha
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadBooked();
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function handleBook(slot) {
    setMsg(null);
    if (!user) {
      onRequireLogin?.();
      return;
    }
    // doble comprobación local: si slot ya reservado por booked state
    if (bookedOverlap(slot, booked)) {
      setMsg('Esa franja ya está ocupada. Refresca y prueba otra.');
      await loadBooked();
      return;
    }
    try {
      const body = {
        userId: user.id,
        title: `Cita con ${user.name}`,
        description: 'Reserva desde la web',
        startDate: slot.start,
        endDate: slot.end,
        location: 'Presencial'
      };
      const created = await api.post('/api/appointments', body);
      setMsg('Cita reservada correctamente.');
      // actualizar UI: quitar slot reservado
      setSlots(prev => prev.filter(s => s.start !== slot.start));
      // refrescar booked y notificar otras vistas
      await loadBooked();
      window.dispatchEvent(new CustomEvent('appointmentBooked', { detail: created || body }));
    } catch (e) {
      setMsg('No se pudo reservar: ' + e.message);
    }
  }

  return (
    <div className="container booking-component">
      <h3 className="section-title">Reservar cita</h3>
      {msg && <div className="auth-error">{msg}</div>}
      <div style={{ marginBottom: 12 }}>
        <label>Fecha: <input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
        <button className="btn" onClick={loadBooked} disabled={loading} style={{ marginLeft: 8 }}>Refrescar</button>
      </div>

      <div>
        {loading && <p>Cargando horas...</p>}
        {!loading && slots.length === 0 && <p>No hay franjas disponibles para este día.</p>}
        <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
          {slots.map(s => (
            <div key={s.start} className="slot-card" style={{ padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
              <div>{s.label}</div>
              <div style={{ marginTop: 8 }}>
                <button className="btn" onClick={() => handleBook(s)}>Reservar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}