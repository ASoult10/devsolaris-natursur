import React, { useEffect, useState } from 'react';
import { getMyAppointments } from '../api/apiUser'; // tu API existente
import { format } from 'date-fns';

function useApi(user) {
  const token = user?.token;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  async function parseJsonResponse(res) {
    const text = await res.text().catch(() => '');
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (res.status === 401) { const err = new Error('No autorizado (401)'); err.status = 401; throw err; }
    if (res.status === 403) { const err = new Error('Acceso denegado (403)'); err.status = 403; throw err; }
    if (!res.ok) { const err = new Error(text || `${res.status} ${res.statusText}`); err.status = res.status; throw err; }
    if (!ct.includes('application/json')) { const err = new Error('Respuesta no JSON'); err.body = text; throw err; }
    try { return JSON.parse(text || 'null'); } catch (e) { const err = new Error('JSON inválido'); err.body = text; throw err; }
  }

  async function get(path) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...authHeader } });
    return parseJsonResponse(res);
  }
  return { get };
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
                <span style={{ color: '#555', fontWeight: '500' }}>{formatted}</span>
              </div>
            );
          })
        )}

        <img
          src="/refresh.png"
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
}

export default function UserPanel({ user }) {
  const [tab, setTab] = useState('citas');
  return (
    <section id="mis-datos" className="section user-panel">
      <div className="container">
        <h3 className="section-title">Mi área</h3>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className={`btn ${tab === 'citas' ? 'active' : ''}`} onClick={() => setTab('citas')}>Mis citas</button>
          <button className={`btn ${tab === 'pedidos' ? 'active' : ''}`} onClick={() => setTab('pedidos')}>Mis pedidos</button>
        </div>

        {tab === 'citas' && <MyAppointments user={user} />}
        {tab === 'pedidos' && <MyOrders user={user} />}
      </div>
    </section>
  );
}
