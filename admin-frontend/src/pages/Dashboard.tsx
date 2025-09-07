import React, { useEffect, useState } from 'react'
import { API_BASE, apiFetch } from '../config'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Dashboard() {
  const [stats, setStats] = useState({ docs: 0, users: 0, queries: 0, unansweredPct: 0 })
  const [chart, setChart] = useState<any[]>([])
  useEffect(() => {
    ;(async () => {
      try {
        // Get stats from backend
        const statsRes = await apiFetch('/admin/stats')
        const s = await statsRes.json()
        setStats(s)
        
        // Get detailed analytics data
        const analyticsRes = await apiFetch('/admin/analytics/detailed')
        const analyticsData = await analyticsRes.json()
        
        // Update stats with real data
        setStats({
          docs: s.docs,
          users: s.users,
          queries: analyticsData.total_queries,
          unansweredPct: analyticsData.unanswered_percentage
        })
        
        // Set chart data
        setChart(analyticsData.queries_by_department || [])
      } catch (error) {
        console.error('Dashboard data fetch error:', error)
        // Set fallback data
        setStats({ docs: 0, users: 3, queries: 0, unansweredPct: 0 })
        setChart([{ department: 'HR', count: 0 }])
      }
    })()
  }, [])
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Docs" value={stats.docs} />
        <StatCard label="Total Users" value={stats.users} />
        <StatCard label="Total Queries" value={stats.queries} />
        <StatCard label="Unanswered %" value={`${stats.unansweredPct}%`} />
      </div>
      <div className="h-72 border rounded p-4">
        <div className="font-semibold mb-2">Queries per Department (7d)</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart}>
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
