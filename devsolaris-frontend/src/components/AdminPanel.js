import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import '../style.css';

// --- INICIO: Importación de imágenes desde src/resources ---
import crearIcon from '../resources/crear.png';
import deleteIcon from '../resources/delete.png';
import refreshIcon from '../resources/refresh.png';
import doneIcon from '../resources/comprobado.png';
// --- FIN: Importación de imágenes ---

const API_BASE = "https://devsolaris-app-natursur.azurewebsites.net";
function buildUrl(path) {
  return API_BASE ? API_BASE.replace(/\/$/, '') + path : path;
}
function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
async function parseResponse(res) {
  const text = await res.text();
  if (!text.trim()) return [];
  const ct = res.headers.get("content-type")?.toLowerCase() || "";
  if (!ct.includes("application/json")) {
    throw { status: res.status, message: "Respuesta no JSON", body: text };
  }
  return JSON.parse(text);
}

function useApi(user) {
  const token = user?.token;

  async function get(path) {
    const res = await fetch(buildUrl(path), { headers: { 'Content-Type': 'application/json', ...authHeaders(token) } });
    return parseResponse(res);
  }

  async function post(path, body) {
    const res = await fetch(buildUrl(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(body)
    });
    return parseResponse(res);
  }

  async function del(path) {
    const res = await fetch(buildUrl(path), { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders(token) } });
    return parseResponse(res).catch(() => ({}));
  }

  return { get, post, del };
}

// --------- COMPONENTE ---------
export default function AdminPanel({ user }) {
  const [tab, setTab] = useState('users');

  return (
    <section id="admin-panel" className="section">
      <div className="container">
        <h2 className="section-title">Panel de Administración</h2>
        
        <div className="admin-tabs">
          <button 
            onClick={() => setTab('users')} 
            className={`admin-tab ${tab === 'users' ? 'active' : ''}`}
          >
            Usuarios
          </button>
          <button 
            onClick={() => setTab('appointments')} 
            className={`admin-tab ${tab === 'appointments' ? 'active' : ''}`}
          >
            Citas
          </button>
          <button 
            onClick={() => setTab('orders')} 
            className={`admin-tab ${tab === 'orders' ? 'active' : ''}`}
          >
            Pedidos
          </button>
        </div>

        <div className="admin-content">
          {tab === 'users' && <AdminUsers user={user} />}
          {tab === 'appointments' && <AdminAppointments user={user} />}
          {tab === 'orders' && <AdminOrders user={user} />}
        </div>
      </div>
    </section>
  );
}

function AdminUsers({ user }) {
  const api = useApi(user);
  const [users, setUsers] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
  const [error, setError] = useState(null);

  async function loadUsers() {
    setError(null);
    try {
      const data = await api.get('/api/users');
      const filtered = data
        .filter(u => (u.role === 'CLIENT' || u.role === 'ADMIN') && u.id !== user.userId)
        .sort((a,b) => a.name.localeCompare(b.name));
      setUsers(filtered);
    } catch (e) {
      setError('Error cargando usuarios: ' + (e.message || e));
      setUsers([]);
    }
  }

  useEffect(() => { loadUsers(); }, [user?.token]);

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/auth/register', newUser);
      setCreating(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
      await loadUsers();
    } catch (e) {
      setError('Error creando usuario: ' + (e.message || e));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Eliminar usuario ' + id + '?')) return;
    try {
      await api.del(`/api/users/${id}`);
      await loadUsers();
    } catch (e) {
      setError('Error eliminando usuario: ' + (e.message || e));
    }
  }

  return (
    <div>
      {error && <div className="auth-error">{error}</div>}

      <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
        <img
          src={crearIcon}
          alt="Crear usuario"
          style={{ width:32, height:32, cursor:'pointer' }}
          onClick={() => setCreating(true)}
        />
        <span>Crear usuario</span>
      </div>

      {creating && (
        <form onSubmit={handleCreate} style={{ marginBottom: 16 }}>
          <input required placeholder="Nombre" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
          <input required type="email" placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          <input required type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
          <input placeholder="Teléfono" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} />
          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
            <option value="CLIENT">CLIENTE</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
            <button className="admin-tab" type="submit">Crear</button>
            <button className="admin-tab" type="button" onClick={() => setCreating(false)}>Cancelar</button>
          </div>
        </form>
      )}


      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        {users.length === 0 ? (
          <p>No hay usuarios registrados.</p>
        ) : (
          users.map(u => (
            <div
              key={u.id}
              className="user-entry"
              style={{
                padding: 8,
                borderRadius: 6,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p><strong>{u.name}</strong></p>
                <p>{u.email}</p>
                {u.phone && <p>Tel: {u.phone}</p>}
                <p>Rol: {u.role}</p>
              </div>
              <img
                src={deleteIcon}
                alt="Eliminar"
                style={{ width: 24, height: 24, cursor: 'pointer' }}
                onClick={() => handleDelete(u.id)}
              />
            </div>
          ))
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <img
            src={refreshIcon}
            alt="Refrescar"
            onClick={loadUsers}
            style={{ width: 32, height: 32, cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}

function AdminAppointments({ user }) {
  const api = useApi(user);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  async function loadAppointments() {
    setError(null);
    try {
      const data = await api.get('/api/appointments');
      const sorted = data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setAppointments(sorted);
    } catch (e) {
      setError('No se pudieron cargar las citas: ' + (e.message || e));
      setAppointments([]);
    }
  }

  useEffect(() => { loadAppointments(); }, [user?.token]);

  async function handleDelete(id) {
    if (!window.confirm('Eliminar esta cita?')) return;
    try {
      await api.del(`/api/appointments/${id}`);
      await loadAppointments();
    } catch (e) {
      setError('Error eliminando cita: ' + (e.message || e));
    }
  }

  return (
    <div>
      {error && <div className="auth-error">{error}</div>}

      <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
        {appointments.length === 0 ? (
          <p>No hay citas registradas.</p>
        ) : (
          appointments.map(a => {
            const formatted = format(new Date(a.startTime), 'HH:mm dd/MM/yyyy');
            return (
              <div key={a.id} className="appointment-entry" style={{ padding:8, borderRadius:6, backgroundColor:'#f5f5f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <p><strong>{a.title}</strong></p>
                  <p>{a.userName} ({a.userEmail})</p>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <span style={{ color:'#555', fontWeight:500 }}>{formatted}</span>
                  <img
                    src={deleteIcon}
                    alt="Eliminar cita"
                    style={{ width:24, height:24, cursor:'pointer' }}
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
          style={{ width:32, height:32, cursor:'pointer', alignSelf:'flex-end', marginTop:4 }}
        />
      </div>
    </div>
  );
}

function AdminOrders({ user }) {
  const api = useApi(user);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadOrders() {
    setError(null);
    setLoading(true);
    try {
      const data = await api.get('/api/orders');
      // Ordena por ID, de más reciente a más antiguo
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (e) {
      setError(`Error al cargar los pedidos: ${e.message}.`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.token) {
      loadOrders();
    }
  }, [user?.token]);

  async function handleDelete(id) {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) return;
    try {
      await api.del(`/api/orders/${id}`);
      await loadOrders(); // Recargar la lista después de eliminar
    } catch (e) {
      setError('Error al eliminar el pedido: ' + (e.message || e));
    }
  }

  // Función para mostrar los items de forma legible
  const renderOrderItems = (itemsJson) => {
    try {
      const items = JSON.parse(itemsJson);
      if (!Array.isArray(items)) return itemsJson;

      return (
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item.product || 'N/A'} (x{item.cantidad || 1})
            </li>
          ))}
        </ul>
      );
    } catch (e) {
      return <p>Error al procesar items.</p>;
    }
  };

  return (
    <div>
      {error && <div className="auth-error">{error}</div>}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <img
          src={refreshIcon}
          alt="Refrescar"
          onClick={loadOrders}
          style={{ width: 32, height: 32, cursor: 'pointer' }}
          disabled={loading}
        />
      </div>

      {loading && <p>Cargando pedidos...</p>}

      {!loading && orders.length === 0 && (
        <p>No hay pedidos registrados en la base de datos.</p>
      )}

      <div className="testimonials-list">
        {orders.map(order => (
          <div key={order.id} className="testimonial">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p><strong>Cliente:</strong> {order.fullName || order.username} (ID: {order.userId})</p>
                <p><strong>Fecha:</strong> {new Date(order.timestamp).toLocaleString()}</p>
                <div><strong>Items:</strong> {renderOrderItems(order.items)}</div>
              </div>
              <img
                src={doneIcon}
                alt="Terminar pedido"
                style={{ width: 24, height: 24, cursor: 'pointer', marginTop: '4px' }}
                onClick={() => handleDelete(order.id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}