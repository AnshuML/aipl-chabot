import React from 'react'
import { useDataProvider } from 'react-admin'

export default function TestPage() {
  const dataProvider = useDataProvider()
  const [data, setData] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    dataProvider.getList('docs', {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' },
      filter: {}
    })
    .then(response => {
      console.log('API Response:', response)
      setData(response)
    })
    .catch(err => {
      console.error('API Error:', err)
      setError(err)
    })
  }, [dataProvider])

  return (
    <div style={{ padding: '20px' }}>
      <h2>API Test Page</h2>
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}
      {data && (
        <div>
          <h3>Success! Data received:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
