import React, { useEffect, useState } from 'react';
import { getMyAppointments } from '../api/apiUser';
import { format } from 'date-fns';

// --- INICIO: Importación de imágenes desde src/resources ---
import deleteIcon from '../resources/delete.png';
import refreshIcon from '../resources/refresh.png';
// --- FIN: Importación de imágenes ---

const API_BASE = "http://localhost:8080";

function buildUrl(path) {
  return API_BASE ? API_BASE.replace(/\/$/, '') + path : path;
}

async function deleteAppointmentApi(appointmentId, token) {
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(buildUrl(`/api/appointments/${appointmentId}`), {
    method: 'DELETE',
    headers: authHeader,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Error desconocido');
    throw new Error(errorText || `Error ${res.status}`);
  }
  return { success: true };
}

export function MyAppointments({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  async function loadAppointments() {
    setError(null);
    try {
      if (!user || !user.userId) {
        setAppointments([]);
        return;
      }
      const data = await getMyAppointments(user.userId, user.token);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('No se pudieron cargar las citas: ' + (e.message || e));
      setAppointments([]);
    }
  }

  useEffect(() => {
    loadAppointments();

    const onBooked = () => loadAppointments();
    window.addEventListener('appointmentBooked', onBooked);
    return () => window.removeEventListener('appointmentBooked', onBooked);
  }, [user?.userId, user?.token]);

  async function handleDelete(appointmentId) {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return;
    }
    setError(null);
    try {
      await deleteAppointmentApi(appointmentId, user.token);
      await loadAppointments();
    } catch (e) {
      setError('Error al cancelar la cita: ' + e.message);
    }
  }

  return (
    <div id="mis-citas" className="container">
      <h3 className="section-title">Mis citas</h3>
      {error && <div className="auth-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', position: 'relative' }}>
        {appointments.length === 0 ? (
          <p>No tienes citas registradas.</p>
        ) : (
          appointments.map(a => {
            const startDate = new Date(a.startTime);
            const formatted = format(startDate, 'HH:mm dd/MM/yyyy');
            return (
              <div
                key={a.id}
                className="appointment-entry"
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f5f5f5',
                  fontSize: '0.95rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                <span>{a.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#555', fontWeight: '500' }}>{formatted}</span>
                  <img
                    src={deleteIcon}
                    alt="Cancelar cita"
                    style={{ width: 20, height: 20, cursor: 'pointer' }}
                    onClick={() => handleDelete(a.id)}
                  />
                </div>
              </div>
            );
          })
        )}

        <img
          src={refreshIcon}
          alt="Refrescar"
          onClick={loadAppointments}
          style={{
            width: 32,
            height: 32,
            cursor: 'pointer',
            alignSelf: 'flex-end',
            marginTop: '4px'
          }}
        />
      </div>
    </div>
  );
}

/*
export function MyOrders({ user }) {
  const api = useApi(user);
  const [orders, setOrders] = useState([]);
  const [error] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get('/api/orders');
        if (!mounted) return;
        const filtered = Array.isArray(data)
          ? data.filter(o => (o.userEmail && o.userEmail.toLowerCase() === (user.email || '').toLowerCase()) || (o.userId && String(o.userId) === String(user.userId)))
          : [];
        setOrders(filtered);
      } catch (e) {
        if (mounted) setOrders(null);
      }
    })();
    return () => { mounted = false; };
  }, [api, user.email, user.userId]);

  return (
    <div id="mis-pedidos" className="container">
      <h3 className="section-title">Mis pedidos</h3>
      {error && <div className="auth-error">{error}</div>}

      {orders === null && (
        <div>
          <p>No hay endpoint de pedidos en el backend. Si implementas /api/orders, aquí se mostrarán tus pedidos.</p>
        </div>
      )}

      {Array.isArray(orders) && orders.length === 0 && <p>No tienes pedidos registrados.</p>}

      {Array.isArray(orders) && orders.length > 0 && (
        <div className="testimonials-list">
          {orders.map(o => (
            <div key={o.id} className="testimonial">
              <p><strong>Pedido #{o.id}</strong> — {o.status || 'Sin estado'}</p>
              <p>Fecha: {o.createdAt || o.date}</p>
              <p>Total: {o.total || o.amount || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}*/

export default function UserPanel({ user }) {
  const [tab, setTab] = useState('citas');
  return (
    <section id="mis-datos" className="section user-panel">
      <div className="container">
        <h3 className="section-title">Mi área</h3>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className={`btn ${tab === 'citas' ? 'active' : ''}`} onClick={() => setTab('citas')}>Mis citas</button>
        </div>

        {tab === 'citas' && <MyAppointments user={user} />}
      </div>
    </section>
  );
}
