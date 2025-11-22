import React, { useEffect, useState, useCallback } from 'react';
import { getMyAppointments, createMyAppointment } from '../api/apiUser';

/**
 * Construye ISO-local sin sufijo Z: yyyy-MM-ddTHH:mm:ss
 */
function toLocalIsoNoZone(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
}

/**
 * Construye franjas horarias de un día
 */
function buildDaySlots(dateStr, startHour = 8, endHour = 15, slotMinutes = 60) {
  const slots = [];
  const [yy, mm, dd] = dateStr.split('-').map(Number);
  for (let h = startHour; h < endHour; h++) {
    const s = new Date(yy, mm - 1, dd, h, 0, 0);
    const e = new Date(s);
    e.setMinutes(e.getMinutes() + slotMinutes);
    slots.push({
      startTime: toLocalIsoNoZone(s),
      endTime: toLocalIsoNoZone(e),
      label: `${String(h).padStart(2,'0')}:00 - ${String(h+1).padStart(2,'0')}:00`
    });
  }
  return slots;
}

/**
 * Comprueba si una franja horaria se solapa con una cita existente
 */
function overlap(slot, appointment) {
  const s1 = new Date(slot.startTime).getTime();
  const e1 = new Date(slot.endTime).getTime();
  const bs = appointment.startTime ? new Date(appointment.startTime).getTime() : 0;
  const be = appointment.endTime ? new Date(appointment.endTime).getTime() : 0;
  if (!bs || !be) return false;
  return Math.max(s1, bs) < Math.min(e1, be);
}

export default function Booking({ user, onRequireLogin }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState([]);
  const [booked, setBooked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [bookingSlot, setBookingSlot] = useState(null);

  const loadBooked = useCallback(async () => {
    if (!user) return;
    setMsg(null);
    setLoading(true);
    try {
      const startDate = new Date(date); startDate.setHours(0,0,0,0);
      const endDate = new Date(date); endDate.setHours(23,59,59,999);

      const data = await getMyAppointments(user.id, user.token);
      const arr = Array.isArray(data) ? data : [];
      setBooked(arr);

      const allSlots = buildDaySlots(date);
      const available = allSlots.filter(s => !arr.some(b => overlap(s, b)));
      setSlots(available);
    } catch (e) {
      setMsg('Error cargando citas: ' + (e.message || JSON.stringify(e)));
      setSlots(buildDaySlots(date));
      setBooked([]);
    } finally {
      setLoading(false);
    }
  }, [date, user]);

  useEffect(() => { loadBooked(); }, [loadBooked]);

  async function handleBook(slot) {
    setMsg(null);
    if (!user) { onRequireLogin?.(); return; }

    if (booked.some(b => overlap(slot, b))) {
      setMsg('Esa franja ya está ocupada. Refresca y prueba otra.');
      await loadBooked();
      return;
    }

    setBookingSlot(slot.startTime);
    try {
      const req = {
        userId: user.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        title: `Cita con ${user.name}`,
        description: 'Reserva desde la web'
      };
      const created = await createMyAppointment(req, user.token);

      if (created && created.id) {
        setBooked(prev => [...prev, created]);
        setSlots(prev => prev.filter(s => !overlap(s, created)));
        setMsg('Cita reservada correctamente.');
        window.dispatchEvent(new CustomEvent('appointmentBooked', { detail: created }));
      } else {
        setMsg('Cita reservada correctamente. Actualizando...');
        await loadBooked();
      }
    } catch (e) {
      setMsg('No se pudo reservar: ' + (e.message || JSON.stringify(e)));
      if (e && e.status === 401) onRequireLogin?.();
      await loadBooked();
    } finally {
      setBookingSlot(null);
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
          {slots.map(s => {
            const disabled = bookingSlot === s.startTime || booked.some(b => overlap(s, b));
            return (
              <div key={s.startTime} className="slot-card" style={{ padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
                <div>{s.label}</div>
                <div style={{ marginTop: 8 }}>
                  <button className="btn" onClick={() => handleBook(s)} disabled={disabled}>
                    {bookingSlot === s.startTime ? 'Reservando...' : 'Reservar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
