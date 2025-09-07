const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

export async function chat(user: string, department: string, query: string, language?: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, department, query, language }),
  })
  if (!res.ok) throw new Error('API error')
  return res.json()
}

export async function upload(department: string, files: FileList) {
  const form = new FormData()
  form.append('department', department)
  Array.from(files).forEach(f => form.append('files', f))
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: form })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}
