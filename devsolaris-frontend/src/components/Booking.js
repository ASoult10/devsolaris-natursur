import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameDay, format, isBefore, isSameMonth, addMonths, subMonths } from 'date-fns';

/**
 * Booking component:
 * - muestra un calendario mensual
 * - los días pasados aparecen gris y tachados (no seleccionables)
 * - el día actual se marca
 * - al seleccionar un día, en la columna derecha aparecen huecos horarios disponibles
 * - disponibilidad simulada por tipo de cita y día (puedes conectar a API)
 *
 * Requisitos en el PDF: el calendario aparece al deslizar hacia abajo desde "Reserva tu cita".
 * Aquí hemos colocado el componente en la sección id="booking" para que el botón "Reserva tu sesión ahora"
 * lo desplace.
 *
 * Referencia PDF de requisitos: mockup del flujo de reserva. :contentReference[oaicite:2]{index=2}
 */

const TYPES = [
  { id: 'consulta', label: 'Consulta (30 min)' },
  { id: 'masaje', label: 'Masaje (45 min)' },
  { id: 'nutricion', label: 'Asesoramiento nutricional (60 min)' }
];

function generateMockSlots(day, typeId) {
  // Genera huecos mock: entre 9:00 y 18:00 con variaciones
  const base = [9,10,11,12,15,16,17];
  // Simula que algunos días tienen menos huecos
  const dayNum = day.getDate();
  const slots = base.filter(h => ((h + dayNum + (typeId.length)) % 3) !== 0);
  return slots.map(h => `${String(h).padStart(2, '0')}:00`);
}

export default function Booking({ user, onRequireLogin }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState(TYPES[0].id);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      days.push(day);
      day = addDays(day, 1);
    }
    rows.push(days);
    days = [];
  }

  const today = new Date();

  const slots = useMemo(() => {
    // si la fecha seleccionada es pasada => [] ; si es futuro => generar slots mock
    if (isBefore(selectedDate, new Date(today.getFullYear(), today.getMonth(), today.getDate()))) {
      return [];
    }
    return generateMockSlots(selectedDate, selectedType);
  }, [selectedDate, selectedType]);

  function onSelectDay(d) {
    // no seleccionar días pasados
    const compareDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isBefore(d, compareDay)) return;
    setSelectedDate(d);
  }

  function reserveSlot(time) {
    if (!user) {
      onRequireLogin();
      return;
    }
    const payload = {
      user,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time,
      type: selectedType
    };
    // Simulación: aquí harías POST al backend. Por ahora usamos alert + console
    alert(`Reserva simulada:\n${payload.date} ${time} — ${selectedType}\nUsuario: ${user.name}`);
    console.log('Reserva payload', payload);
  }

  return (
    <div className="booking-grid container">
      <div className="calendar-card card">
        <div className="card-header">
          <button className="icon-btn" onClick={() => setCurrentMonth(subMonths(currentMonth,1))}>‹</button>
          <h4>{format(currentMonth, 'MMMM yyyy')}</h4>
          <button className="icon-btn" onClick={() => setCurrentMonth(addMonths(currentMonth,1))}>›</button>
        </div>

        <div className="calendar">
          <div className="weekdays">
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} className="weekday">{d}</div>
            ))}
          </div>

          {rows.map((week, wi) => (
            <div className="week" key={wi}>
              {week.map((d, i) => {
                const isToday = isSameDay(d, today);
                const disabled = isBefore(d, new Date(today.getFullYear(), today.getMonth(), today.getDate()));
                const inMonth = isSameMonth(d, monthStart);
                const selected = isSameDay(d, selectedDate);

                return (
                  <button
                    key={i}
                    className={
                      'day' +
                      (disabled ? ' day-disabled' : '') +
                      (!inMonth ? ' day-outmonth' : '') +
                      (isToday ? ' day-today' : '') +
                      (selected ? ' day-selected' : '')
                    }
                    onClick={() => onSelectDay(d)}
                    disabled={disabled}
                    title={format(d, 'yyyy-MM-dd')}
                  >
                    <span className="day-number">{format(d, 'd')}</span>
                    {disabled && <span className="day-overlay">✕</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <aside className="slots-card card">
        <div className="card-header">
          <h4>Huecos disponibles</h4>
        </div>

        <div className="card-body">
          <label>Tipo de cita</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="select">
            {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>

          <div className="selected-day">
            <strong>{format(selectedDate, 'EEEE, dd MMMM yyyy')}</strong>
          </div>

          {slots.length === 0 ? (
            <p className="muted">No hay huecos disponibles para este día.</p>
          ) : (
            <div className="slots-list">
              {slots.map((s, i) => (
                <button key={i} className="slot-btn" onClick={() => reserveSlot(s)}>{s}</button>
              ))}
            </div>
          )}

          <div className="note muted">
            Los días pasados aparecen deshabilitados y tachados. El día actual está resaltado.
          </div>
        </div>
      </aside>
    </div>
  );
}
