import React, { useState, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab
} from "@mui/material"
import { RefreshCw, TrendingUp, Users, FileText, CheckCircle, XCircle, BarChart3, PieChart, LineChart } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'

interface AnswerStatusData {
  summary: {
    total_interactions: number
    date_range_days: number
    department_filter: string | null
    user_filter: string | null
    generated_at: string
  }
  answer_status: {
    [key: string]: {
      count: number
      percentage: number
    }
  }
  department_performance: {
    [key: string]: {
      total_queries: number
      answered: number
      failed: number
      success_rate: number
    }
  }
  user_performance: {
    [key: string]: {
      total_queries: number
      answered: number
      failed: number
      success_rate: number
    }
  }
  quality_metrics: {
    [key: string]: {
      count: number
      percentage: number
    }
  }
  overall_success_rate: number
}

interface RecentInteraction {
  timestamp: string
  user_name: string
  department: string
  query: string
  answer_status: string
  docs_used_count: number
  quality_score: number
  has_answer: boolean
}

interface PerformanceMetrics {
  overall_metrics: {
    total_queries: number
    answered_queries: number
    failed_queries: number
    success_rate: number
    average_docs_used: number
  }
  department_distribution: { [key: string]: number }
  user_activity: { [key: string]: number }
  data_period: {
    earliest: string | null
    latest: string | null
  }
}

export default function Analytics() {
  const [answerStatusData, setAnswerStatusData] = useState<AnswerStatusData | null>(null)
  const [recentInteractions, setRecentInteractions] = useState<RecentInteraction[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState(7)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [tabValue, setTabValue] = useState(0)

  const API_BASE = (import.meta as any).env?.VITE_ADMIN_API_URL || 'http://localhost:8000'

  const fetchAnalyticsData = async () => {
    setLoading(true)
    try {
      // Fetch answer status analytics
      const statusResponse = await fetch(`${API_BASE}/analytics/answer-status?days=${selectedDays}&department=${selectedDepartment === 'all' ? '' : selectedDepartment}`)
      const statusData = await statusResponse.json()
      setAnswerStatusData(statusData)

      // Fetch recent interactions
      const recentResponse = await fetch(`${API_BASE}/analytics/recent-interactions?limit=20`)
      const recentData = await recentResponse.json()
      setRecentInteractions(recentData.recent_interactions)

      // Fetch performance metrics
      const metricsResponse = await fetch(`${API_BASE}/analytics/performance-metrics`)
      const metricsData = await metricsResponse.json()
      setPerformanceMetrics(metricsData)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedDays, selectedDepartment])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'success'
      case 'failed': return 'error'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  // Chart data preparation functions
  const prepareDepartmentChartData = () => {
    if (!answerStatusData) return []
    return Object.entries(answerStatusData.department_performance).map(([dept, data]) => ({
      department: dept,
      success_rate: data.success_rate,
      total_queries: data.total_queries,
      answered: data.answered,
      failed: data.failed
    }))
  }

  const prepareStatusPieData = () => {
    if (!answerStatusData) return []
    const colors = ['#4CAF50', '#F44336', '#FF9800', '#2196F3']
    return Object.entries(answerStatusData.answer_status).map(([status, data], index) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: data.count,
      percentage: data.percentage,
      fill: colors[index % colors.length]
    }))
  }

  const prepareQualityChartData = () => {
    if (!answerStatusData) return []
    return Object.entries(answerStatusData.quality_metrics).map(([quality, data]) => ({
      quality: quality.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: data.count,
      percentage: data.percentage
    }))
  }

  const prepareDailyTrendData = () => {
    if (!answerStatusData) return []
    return Object.entries(answerStatusData.daily_trends).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      success_rate: data.success_rate,
      total_queries: data.total_queries,
      answered: data.answered,
      failed: data.failed
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const prepareUserActivityData = () => {
    if (!answerStatusData) return []
    return Object.entries(answerStatusData.user_performance).map(([user, data]) => ({
      user: user,
      success_rate: data.success_rate,
      total_queries: data.total_queries,
      answered: data.answered,
      failed: data.failed
    }))
  }

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="400px">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading analytics...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Days</InputLabel>
            <Select
              value={selectedDays.toString()}
              label="Days"
              onChange={(e) => setSelectedDays(parseInt(e.target.value))}
            >
              <MenuItem value="1">1 Day</MenuItem>
              <MenuItem value="7">7 Days</MenuItem>
              <MenuItem value="30">30 Days</MenuItem>
              <MenuItem value="90">90 Days</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={selectedDepartment}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="all">All Departments</MenuItem>
              <MenuItem value="IT">IT</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Accounts">Accounts</MenuItem>
              <MenuItem value="Factory">Factory</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
            </Select>
          </FormControl>
          <Button onClick={fetchAnalyticsData} variant="outlined" startIcon={<RefreshCw />}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<BarChart3 />} label="Overview" />
          <Tab icon={<PieChart />} label="Charts" />
          <Tab icon={<LineChart />} label="Trends" />
          <Tab icon={<Users />} label="Users" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <>
          {/* Overall Metrics */}
      {performanceMetrics && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Queries
                    </Typography>
                    <Typography variant="h4">
                      {performanceMetrics.overall_metrics.total_queries}
                    </Typography>
                  </Box>
                  <FileText color="primary" size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Success Rate
                    </Typography>
                    <Typography variant="h4">
                      {performanceMetrics.overall_metrics.success_rate}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={performanceMetrics.overall_metrics.success_rate} 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <TrendingUp color="success" size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Answered
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {performanceMetrics.overall_metrics.answered_queries}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Failed
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {performanceMetrics.overall_metrics.failed_queries}
                    </Typography>
                  </Box>
                  <XCircle color="error" size={40} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Answer Status Breakdown */}
      {answerStatusData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Answer Status Breakdown
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(answerStatusData.answer_status).map(([status, data]) => (
                <Box key={status} display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label={status} 
                      color={getStatusColor(status) as any}
                      size="small"
                    />
                    <Typography variant="body2" color="textSecondary">
                      {data.count} queries
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body1" fontWeight="medium">
                      {data.percentage}%
                    </Typography>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress variant="determinate" value={data.percentage} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Department Performance */}
      {answerStatusData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Department Performance
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(answerStatusData.department_performance).map(([dept, data]) => (
                <Box key={dept} display="flex" alignItems="center" justifyContent="space-between" p={2} border="1px solid" borderColor="divider" borderRadius={1} mb={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {dept}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {data.total_queries} total queries
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h6" fontWeight="bold">
                      {data.success_rate}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {data.answered} answered, {data.failed} failed
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Recent Interactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Interactions
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Query</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Quality</TableCell>
                  <TableCell>Docs</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentInteractions.map((interaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{interaction.user_name}</TableCell>
                    <TableCell>
                      <Chip label={interaction.department} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {interaction.query}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={interaction.answer_status} 
                        color={getStatusColor(interaction.answer_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={interaction.quality_score >= 80 ? 'success.main' : interaction.quality_score >= 60 ? 'warning.main' : 'error.main'}
                        fontWeight="medium"
                      >
                        {interaction.quality_score.toFixed(0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>{interaction.docs_used_count}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(interaction.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
        </>
      )}

      {/* Charts Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {/* Department Performance Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Department Performance
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareDepartmentChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success_rate" fill="#4CAF50" name="Success Rate (%)" />
                    <Bar dataKey="total_queries" fill="#2196F3" name="Total Queries" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Answer Status Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Answer Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value, name, props) => [`${value} (${props.payload.percentage}%)`, name]} />
                    <Legend />
                    <Pie
                      data={prepareStatusPieData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareStatusPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Quality Metrics Bar Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Answer Quality Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareQualityChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quality" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend />
                    <Bar dataKey="count" fill="#FF9800" name="Count" />
                    <Bar dataKey="percentage" fill="#9C27B0" name="Percentage" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Trends Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {/* Daily Trends Line Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Success Rate Trends
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsLineChart data={prepareDailyTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="success_rate" stroke="#4CAF50" strokeWidth={3} name="Success Rate (%)" />
                    <Line type="monotone" dataKey="total_queries" stroke="#2196F3" strokeWidth={2} name="Total Queries" />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Daily Activity Area Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Activity Overview
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareDailyTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="answered" stackId="1" stroke="#4CAF50" fill="#4CAF50" name="Answered" />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="#F44336" fill="#F44336" name="Failed" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Users Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          {/* User Performance Bar Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={prepareUserActivityData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success_rate" fill="#4CAF50" name="Success Rate (%)" />
                    <Bar dataKey="total_queries" fill="#2196F3" name="Total Queries" />
                    <Bar dataKey="answered" fill="#8BC34A" name="Answered" />
                    <Bar dataKey="failed" fill="#F44336" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* User Activity Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  User Activity Details
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Total Queries</TableCell>
                        <TableCell>Answered</TableCell>
                        <TableCell>Failed</TableCell>
                        <TableCell>Success Rate</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prepareUserActivityData().map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{user.user}</TableCell>
                          <TableCell>{user.total_queries}</TableCell>
                          <TableCell>
                            <Chip label={user.answered} color="success" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={user.failed} color="error" size="small" />
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight="medium">
                                {user.success_rate}%
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={user.success_rate} 
                                sx={{ width: 60, height: 6 }}
                              />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}