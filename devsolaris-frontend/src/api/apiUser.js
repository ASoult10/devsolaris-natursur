const API_BASE = "http://localhost:8080";//"http://devsolaris-app-natursur.azurewebsites.net"

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

// Obtener citas del usuario loggeado
export async function getMyAppointments(userId, token) {
  if (!userId) return [];
  const res = await fetch(buildUrl(`/api/appointments/user/${userId}`), {
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) }
  });

  if (res.status === 401 || res.status === 403) {
    throw { status: res.status, message: "No tienes permisos para ver tus citas." };
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw { status: res.status, message: txt || res.statusText };
  }

  return parseResponse(res);
}

// Crear cita para el usuario loggeado
export async function createMyAppointment(appointmentRequest, token) {
  const res = await fetch(buildUrl('/api/appointments'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(appointmentRequest),
  });

  if (res.status === 201 || res.status === 200) {
    const text = await res.text().catch(() => '');
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (!ct.includes('application/json')) return { raw: text || '' };
    try { return JSON.parse(text || 'null'); } 
    catch (e) { throw { status: res.status, message: 'JSON inválido', body: text }; }
  }

  return parseResponse(res);
}

// Actualizar cita
export async function updateAppointment(id, appointmentRequest, token) {
  const res = await fetch(buildUrl(`/api/appointments/${id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(appointmentRequest),
  });
  return parseResponse(res);
}

// Eliminar cita
export async function deleteAppointment(id, token) {
  const res = await fetch(buildUrl(`/api/appointments/${id}`), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
  });
  return parseResponse(res);
}
