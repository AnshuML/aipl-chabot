import React, { useState } from 'react'
import { List, Datagrid, TextField, DateField, EditButton, DeleteButton, Create, SimpleForm, TextInput, SelectInput } from 'react-admin'
import { apiFetch, API_BASE } from '../config'

export const DocumentsList = () => (
  <List>
    <Datagrid bulkActionButtons={false}>
      <TextField source="id" label="ID" />
      <TextField source="title" label="Title" />
      <TextField source="department" label="Department" />
      <DateField source="upload_date" label="Upload Date" showTime />
      <TextField source="status" label="Status" />
      <TextField source="file_size" label="Size" />
      <TextField source="file_type" label="Type" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
)

export const DocumentsCreate = () => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [department, setDepartment] = useState('IT')
  const [title, setTitle] = useState('')

  const upload = async () => {
    if (!files) {
      alert('Please select files to upload')
      return
    }
    
    try {
      let successCount = 0
      let errorCount = 0
      
      // Upload each file one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const form = new FormData()
        form.append('file', file)
        form.append('department', department)
        form.append('title', title || file.name)
        
        try {
          const response = await fetch(`${API_BASE}/admin/ingest`, {
            method: 'POST',
            body: form
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('Upload successful:', result)
            successCount++
          } else {
            const errorText = await response.text()
            console.error('Upload failed:', response.status, errorText)
            errorCount++
          }
        } catch (fileError) {
          console.error('File upload error:', fileError)
          errorCount++
        }
      }
      
      if (successCount > 0) {
        alert(`Successfully uploaded ${successCount} file(s) to ${department} department!${errorCount > 0 ? ` ${errorCount} file(s) failed.` : ''}`)
        // Reset form
        setFiles(null)
        setTitle('')
        // Refresh the page to show new documents
        window.location.reload()
      } else {
        alert('All uploads failed. Please check the console for details.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    }
  }

  return (
    <Create>
      <SimpleForm toolbar={false}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Document Title:</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title (optional)"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Department:</label>
          <select 
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Accounts">Accounts</option>
            <option value="Factory">Factory</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Select Files:</label>
          <input 
            type="file" 
            multiple 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md" 
            onChange={e => setFiles(e.target.files)}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
            Supported formats: PDF, Word, Excel, Text files
          </small>
        </div>
        
        <button 
          type="button" 
          onClick={upload}
          disabled={!files}
          style={{
            backgroundColor: files ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: files ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          {files ? `Upload ${files.length} File(s)` : 'Select Files First'}
        </button>
      </SimpleForm>
    </Create>
  )
}
