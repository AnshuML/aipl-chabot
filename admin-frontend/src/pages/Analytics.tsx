import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { apiFetch } from '../config'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      setIsDark(document.body.classList.contains('dark-mode'))
    }
    
    checkDarkMode()
    
    // Watch for changes to dark mode
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiFetch('/admin/analytics/detailed')
        const data = await response.json()
        setAnalyticsData(data)
      } catch (error) {
        console.error('Analytics fetch error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analytics...</div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Total Queries</h3>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{analyticsData.total_queries}</p>
        </div>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Answered</h3>
          <p className="text-2xl font-bold text-green-600">{analyticsData.answered_queries}</p>
        </div>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Unanswered</h3>
          <p className="text-2xl font-bold text-red-600">{analyticsData.unanswered_queries}</p>
        </div>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Success Rate</h3>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{100 - analyticsData.unanswered_percentage}%</p>
        </div>
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Total Logins</h3>
          <p className="text-2xl font-bold text-blue-600">{analyticsData.total_logins || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queries by Department */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Queries by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.queries_by_department}>
              <XAxis dataKey="department" stroke={isDark ? '#fff' : '#666'} />
              <YAxis stroke={isDark ? '#fff' : '#666'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#374151' : '#fff', border: isDark ? '1px solid #4B5563' : '1px solid #e5e7eb' }} />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Queries Trend */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Daily Queries Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.daily_queries}>
              <XAxis dataKey="date" stroke={isDark ? '#fff' : '#666'} />
              <YAxis stroke={isDark ? '#fff' : '#666'} />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#374151' : '#fff', border: isDark ? '1px solid #4B5563' : '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Pie Chart */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Questions by Department (%)</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={400} height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.queries_by_department.map((dept: any) => ({
                    name: dept.department,
                    value: dept.count,
                    percentage: ((dept.count / analyticsData.total_queries) * 100).toFixed(1)
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.queries_by_department.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#374151' : '#fff', border: isDark ? '1px solid #4B5563' : '1px solid #e5e7eb' }}
                  formatter={(value: any, name: any, props: any) => [
                    `${value} questions (${props.payload.percentage}%)`,
                    props.payload.name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Answer Status Pie Chart */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Answer Status Distribution</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={400} height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Answered', value: analyticsData.answered_queries },
                    { name: 'Unanswered', value: analyticsData.unanswered_queries }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#374151' : '#fff', border: isDark ? '1px solid #4B5563' : '1px solid #e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Logins */}
      {analyticsData.recent_logins && analyticsData.recent_logins.length > 0 && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Logins</h3>
          <div className="overflow-x-auto">
            <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>User</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Login Time</th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                {analyticsData.recent_logins.map((login: any, index: number) => (
                  <tr key={index}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {login.user_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {login.user_email}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                      {new Date(login.login_time).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
