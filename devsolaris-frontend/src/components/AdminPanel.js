import React, { useEffect, useState } from 'react';

/**
 * AdminPanel
 * - usa user.token para Authorization Bearer
 * - lista/crea/busca/borra usuarios (llama a /api/users y /api/auth/register)
 * - lista/borra citas (llama a /api/appointments)
 * - pedidos: placeholder
 *
 * Referencias backend:
 * - [`springboot.devsolaris_backend.user.UserController`](devsolaris-backend/src/main/java/springboot/devsolaris_backend/user/UserController.java)
 * - [`springboot.devsolaris_backend.appointment.AppointmentController`](devsolaris-backend/src/main/java/springboot/devsolaris_backend/appointment/AppointmentController.java)
 */

function useApi(user) {
  const token = user?.token;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  async function get(path) {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json', ...authHeader } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  async function post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  async function del(path) {
    const res = await fetch(path, { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeader } });
    if (!res.ok) throw new Error(await res.text());
    return res.json().catch(() => ({}));
  }
  return { get, post, del };
}

export default function AdminPanel({ user }) {
  const [tab, setTab] = useState('users');
  return (
    <section id="admin" className="section admin-section">
      <div className="container">
        <h3 className="section-title">Panel de administrador</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className={`btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Usuarios</button>
          <button className={`btn ${tab === 'appointments' ? 'active' : ''}`} onClick={() => setTab('appointments')}>Citas</button>
          <button className={`btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Pedidos</button>
        </div>

        {tab === 'users' && <AdminUsers user={user} />}
        {tab === 'appointments' && <AdminAppointments user={user} />}
        {tab === 'orders' && <AdminOrders />}
      </div>
    </section>
  );
}

function AdminUsers({ user }) {
  const api = useApi(user);
  const [users, setUsers] = useState([]);
  const [emailSearch, setEmailSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function loadUsers() {
      try {
        const data = await api.get('/api/users');
        if (mounted) setUsers(data);
      } catch (e) {
        if (mounted) setError('Error cargando usuarios: ' + e.message);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  function filtered() {
    if (!emailSearch) return users;
    return users.filter(u => u.email.toLowerCase().includes(emailSearch.toLowerCase()));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      // Usamos el endpoint de registro para que la contraseña se codifique correctamente en backend
      await api.post('/api/auth/register', newUser);
      setCreating(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
      // recargar lista
      const data = await api.get('/api/users');
      setUsers(data);
    } catch (e) {
      setError('Error creando usuario: ' + e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminar usuario ' + id + '?')) return;
    try {
      await api.del(`/api/users/${id}`);
      const data = await api.get('/api/users');
      setUsers(data);
    } catch (e) {
      setError('Error eliminando: ' + e.message);
    }
  }

  return (
    <div>
      {error && <div className="auth-error">{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <input placeholder="Buscar por email" value={emailSearch} onChange={e => setEmailSearch(e.target.value)} />
        <button className="btn" onClick={async () => { try { const data = await api.get('/api/users'); setUsers(data); } catch (e) { setError('Error: '+e.message); } }}>Refrescar</button>
        <button className="btn" onClick={() => setCreating(true)}>Crear usuario</button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <input required placeholder="Nombre" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          <input required type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          <input required type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          <input placeholder="Teléfono" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
            <option value="CLIENT">CLIENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div>
            <button className="btn" type="submit">Crear</button>
            <button className="btn" type="button" onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="testimonials-list">
        {filtered().map(u => (
          <div key={u.id} className="testimonial">
            <p><strong>{u.name}</strong> — {u.email}</p>
            <p>Tel: {u.phone} · Rol: {u.role}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => navigator.clipboard?.writeText(u.email)}>Copiar email</button>
              <button className="btn" onClick={() => handleDelete(u.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminAppointments({ user }) {
  const api = useApi(user);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async function load() {
      try {
        const data = await api.get('/api/appointments');
        if (mounted) setAppointments(data);
      } catch (e) {
        if (mounted) setError('Error cargando citas: ' + e.message);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  async function handleDelete(id) {
    if (!window.confirm('Eliminar cita ' + id + '?')) return;
    try {
      await api.del(`/api/appointments/${id}`);
      const data = await api.get('/api/appointments');
      setAppointments(data);
    } catch (e) {
      setError('Error eliminando cita: ' + e.message);
    }
  }

  return (
    <div>
      {error && <div className="auth-error">{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <button className="btn" onClick={async () => { try { const data = await api.get('/api/appointments'); setAppointments(data); } catch (e) { setError('Error: '+e.message); } }}>Refrescar citas</button>
      </div>

      <div className="testimonials-list">
        {appointments.map(a => (
          <div key={a.id} className="testimonial">
            <p><strong>{a.title}</strong> — {a.userName} ({a.userEmail})</p>
            <p>{a.startTime} → {a.endTime}</p>
            <p>{a.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => handleDelete(a.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminOrders() {
  return (
    <div>
      <p>Gestión de pedidos: aún no hay endpoints en backend. Aquí puedes integrar tu API de pedidos.</p>
      <p>TODO: crear endpoints y UI para listar/crear/actualizar/Eliminar pedidos.</p>
    </div>
  );
}