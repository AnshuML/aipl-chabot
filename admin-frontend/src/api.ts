const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

function authHeaders() {
  const token = localStorage.getItem('jwt')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchJSON(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}), ...authHeaders() },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export const Api = {
  ingest(form: FormData) {
    return fetch(`${API_BASE}/admin/ingest`, { method: 'POST', body: form, headers: { ...authHeaders() } })
  },
  docs(params: URLSearchParams) {
    return fetchJSON(`/admin/docs?${params.toString()}`)
  },
  deleteDoc(id: string | number) {
    return fetchJSON(`/admin/docs/${id}`, { method: 'DELETE' })
  },
  logs(params: URLSearchParams) {
    return fetchJSON(`/admin/logs?${params.toString()}`)
  },
  usersList() { return fetchJSON('/admin/users') },
  userAdd(data: any) { return fetchJSON('/admin/users', { method: 'POST', body: JSON.stringify(data) }) },
  userUpdate(id: string|number, data: any) { return fetchJSON(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) },
  userDelete(id: string|number) { return fetchJSON(`/admin/users/${id}`, { method: 'DELETE' }) },
  stats() { return fetchJSON('/admin/stats') },
  analytics() { return fetchJSON('/admin/analytics/queries_per_dept') },
}
