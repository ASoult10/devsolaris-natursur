import React, { useState, useEffect } from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, 
  isSameDay, format, isBefore, isSameMonth, addMonths, subMonths, setHours, setMinutes 
} from 'date-fns';
import { createMyAppointment } from '../api/apiUser'; // tu API

const TYPES = [
  { id: 'consulta', label: 'Consulta (30 min)', duration: 30 },
  { id: 'masaje', label: 'Masaje (45 min)', duration: 45 },
  { id: 'nutricion', label: 'Asesoramiento nutricional (60 min)', duration: 60 }
];

function generateSlots(day, duration, reservedSlots = [], startHour = 8, endHour = 15) {
  const slots = [];
  let slotTime = setHours(setMinutes(new Date(day), 0), startHour);
  const endOfDay = setHours(setMinutes(new Date(day), 0), endHour);

  while (slotTime.getTime() + duration * 60 * 1000 <= endOfDay.getTime()) {
    const slotEnd = new Date(slotTime.getTime() + duration * 60 * 1000);

    const overlaps = reservedSlots.some(app => {
      const appStart = new Date(app.startTime);
      const appEnd = new Date(app.endTime);
      return slotTime < appEnd && slotEnd > appStart;
    });

    if (!overlaps) {
      slots.push(format(slotTime, 'HH:mm'));
    }

    slotTime = new Date(slotTime.getTime() + 30 * 60 * 1000); // incrementa 30 min
  }

  return slots;
}

function formatLocalDate(date) {
  const pad = num => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function Booking({ user, onRequireLogin }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedType, setSelectedType] = useState(TYPES[0].id);
  const [slots, setSlots] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);

  const today = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
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

  useEffect(() => {
    if (isBefore(selectedDate, new Date(today.getFullYear(), today.getMonth(), today.getDate()))) {
      setSlots([]);
    } else {
      const type = TYPES.find(t => t.id === selectedType);
      setSlots(generateSlots(selectedDate, type.duration, reservedSlots));
    }
  }, [selectedDate, selectedType, reservedSlots]);

  function onSelectDay(d) {
    const compareDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (isBefore(d, compareDay) || d.getDay() === 0 || d.getDay() === 6) return; // fin de semana deshabilitado
    setSelectedDate(d);
  }

  async function reserveSlot(time) {
    if (!user) {
      onRequireLogin();
      return;
    }

    const type = TYPES.find(t => t.id === selectedType);
    const start = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    start.setHours(hours, minutes, 0, 0);

    const end = new Date(start.getTime() + type.duration * 60 * 1000);

    const startLocal = formatLocalDate(start);
    const endLocal = formatLocalDate(end);

    const payload = {
      userId: user.userId,
      startTime: startLocal,
      endTime: endLocal,
      title: type.label,
      description: ''
    };

    try {
      await createMyAppointment(payload, user.token);
      setReservedSlots(prev => [...prev, { startTime: startLocal, endTime: endLocal }]);
      alert(`Cita reservada: ${time} — ${type.label}`);
    } catch (e) {
      console.error(e);
      alert('Error al reservar la cita: ' + (e.message || e));
    }
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
                const disabled = 
                  isBefore(d, new Date(today.getFullYear(), today.getMonth(), today.getDate())) ||
                  d.getDay() === 0 || d.getDay() === 6; // deshabilitar fines de semana
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
            Los días pasados y fines de semana aparecen deshabilitados y tachados. El día actual está resaltado.
          </div>
        </div>
      </aside>
    </div>
  );
}
