import React, { useEffect, useMemo, useState } from 'react'

const DEPARTMENTS = ['IT','HR','Accounts','Factory','Marketing']
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'as', name: 'অসমীয়া (Assamese)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'ne', name: 'नेपाली (Nepali)' },
  { code: 'sa', name: 'संस्कृत (Sanskrit)' },
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'zh', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'pt', name: 'Português (Portuguese)' },
  { code: 'ru', name: 'Русский (Russian)' },
  { code: 'it', name: 'Italiano (Italian)' }
]

type Message = { role: 'user'|'assistant'; content: string }
type WelcomeData = { title: string; subtitle: string; greeting: string; is_welcome: boolean }

type UserSession = {
  name: string
  email: string
  user_id: string
}

function useSession() {
  const [user, setUser] = useState<UserSession | null>(null)
  useEffect(() => {
    const saved = localStorage.getItem('user_session')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch (e) {
        localStorage.removeItem('user_session')
      }
    }
  }, [])
  const login = (userData: UserSession) => { 
    localStorage.setItem('user_session', JSON.stringify(userData))
    setUser(userData) 
  }
  const logout = () => { 
    localStorage.removeItem('user_session')
    setUser(null) 
  }
  return { user, login, logout }
}

export default function App() {
  const { user, login, logout } = useSession()
  const [department, setDepartment] = useState(DEPARTMENTS[0])
  const [language, setLanguage] = useState('en')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [welcomeData, setWelcomeData] = useState<WelcomeData | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved) setDarkMode(saved === 'true')
  }, [])

  // Fetch welcome message when user logs in
  useEffect(() => {
    if (user) {
      fetchWelcomeMessage()
    }
  }, [user])

  async function fetchWelcomeMessage() {
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_BASE}/welcome`)
      const data = await res.json()
      setWelcomeData(data)
    } catch (e) {
      console.error('Failed to fetch welcome message:', e)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', (!darkMode).toString())
  }

  async function send() {
    if (!user || !input.trim()) return
    const q = input.trim()
    setMessages(m => [...m, { role: 'user', content: q }])
    setInput('')
    setBusy(true)
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.user_id, department, query: q, language }),
      })
      const json = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: json.answer ?? 'No answer' }])
    } catch (e:any) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error contacting API' }])
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return <Login onLogin={login} darkMode={darkMode} />
  }

  return (
    <div className={`h-screen flex ${darkMode ? 'dark' : ''}`}>
      <aside className="w-80 border-r dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-6">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">Settings</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Configure your chat experience</div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
            <select 
              className="w-full border dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={department} 
              onChange={e=>setDepartment(e.target.value)}
            >
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
            <select 
              className="w-full border dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              value={language} 
              onChange={e=>setLanguage(e.target.value)}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <button 
            onClick={toggleDarkMode}
            className="w-full border dark:border-gray-600 rounded-lg px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2"
          >
            {darkMode ? '☀️' : '🌙'}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <div>💡 Tip: Ask specific questions about your department's documents</div>
            <div>📚 I can help with policies, procedures, and guidelines</div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        <header className="h-16 border-b dark:border-gray-700 px-6 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white">AIPL AI ChatBot</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Intelligent Assistant</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Signed in as</span>
              <span className="ml-1 font-medium text-gray-900 dark:text-white">{user.name}</span>
            </div>
            <button 
              className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2" 
              onClick={logout}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-6 overflow-auto space-y-3">
          {/* Welcome Message */}
          {welcomeData && messages.length === 0 && (
            <div className="text-center py-8">
              <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {welcomeData.title}
                </h1>
                <h2 className="text-2xl font-semibold text-pink-500 dark:text-pink-400">
                  {welcomeData.subtitle}
                </h2>
                <p className="text-xl text-yellow-600 dark:text-yellow-400 font-medium">
                  {welcomeData.greeting}
                </p>
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-300">
                    Ask questions about company documents. I'm here to help you find information from your department's knowledge base.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Chat Messages */}
          {messages.map((m,i)=>(
            <div key={i} className={`max-w-3xl ${m.role==='user'?'ml-auto':''}`}>
              <div className={`rounded-lg px-4 py-3 shadow-sm ${
                m.role==='user'
                  ?'bg-blue-500 text-white ml-auto'
                  :'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                className="w-full border dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={`Ask a question about ${department} department...`}
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                disabled={busy}
              />
            </div>
            <button 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium" 
              disabled={busy || !input.trim()} 
              onClick={send}
            >
              {busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send
                </>
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </main>
    </div>
  )
}

function Login({ onLogin, darkMode }: { onLogin: (userData: UserSession)=>void, darkMode: boolean }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [localDarkMode, setLocalDarkMode] = useState(darkMode)

  const handleLogin = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        onLogin({
          name: name.trim(),
          email: email.trim(),
          user_id: data.user_id
        })
      } else {
        setError(data.message)
      }
    } catch (e) {
      setError('Failed to connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    setLocalDarkMode(!localDarkMode)
    localStorage.setItem('darkMode', (!localDarkMode).toString())
  }

  return (
    <div className={`h-screen grid place-items-center ${localDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} ${localDarkMode ? 'dark' : ''}`}>
      <div className="w-full max-w-md">
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={toggleDarkMode}
            className={`p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${
              localDarkMode 
                ? 'bg-gray-800 border border-gray-600 hover:bg-gray-700' 
                : 'bg-white border border-gray-200 hover:bg-gray-50'
            }`}
            title={localDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-lg">{localDarkMode ? '☀️' : '🌙'}</span>
          </button>
        </div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome To Login Page</h1>
          <p className="text-gray-600 dark:text-gray-400">Company Login Required</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-8 space-y-6 border dark:border-gray-700 backdrop-blur-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
            <input 
              className="w-full border dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={e=>setName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Email</label>
            <input 
              type="email"
              className="w-full border dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              placeholder="your.email@aiplabro.com" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Only @aiplabro.com and @ajitindustries.com emails allowed
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            </div>
          )}
          
          <button 
            className="w-full bg-blue-500 text-white rounded-lg px-4 py-3 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2" 
            onClick={handleLogin}
            disabled={loading || !name.trim() || !email.trim()}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </>
            )}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Only company employees can access this system
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
