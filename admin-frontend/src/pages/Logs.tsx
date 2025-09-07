import React from 'react'
import { List, Datagrid, TextField, DateField, TextInput, TopToolbar, CreateButton, ExportButton, useListContext } from 'react-admin'

const LogFilters = [
  <TextInput key="q" label="Search" source="q" alwaysOn />,
  <TextInput key="dept" label="Department" source="department" />,
  <TextInput key="from" label="From (ISO)" source="from" />,
  <TextInput key="to" label="To (ISO)" source="to" />,
]

export const LogsList = () => (
  <List filters={LogFilters} actions={<ListActions />}>
    <Datagrid bulkActionButtons={false} rowClick="expand">
      <DateField source="timestamp" />
      <TextField source="user" />
      <TextField source="department" />
      <TextField source="question" />
      <TextField source="answer_status" />
    </Datagrid>
  </List>
)

function ListActions() {
  const { exporter } = useListContext()
  
  const handleExport = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/logs/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'query_logs.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }
  
  return (
    <TopToolbar>
      <button 
        onClick={handleExport}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Export CSV
      </button>
    </TopToolbar>
  )
}
