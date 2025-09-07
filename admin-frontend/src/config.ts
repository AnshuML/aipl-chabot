export const API_BASE = (import.meta as any).env?.VITE_ADMIN_API_URL || 'http://localhost:8000'

export async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      // Don't set Content-Type for FormData, let the browser set it
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(()=> '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res
}
