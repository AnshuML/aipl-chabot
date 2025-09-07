import React, { useState, useEffect } from 'react'
import { Admin, Resource, ListGuesser, Layout, AppBar, UserMenu, MenuItemLink } from 'react-admin'
import { API_BASE } from './config'
import Dashboard from './pages/Dashboard'
import { DocumentsList, DocumentsCreate } from './pages/Documents'
import { UsersList, UsersEdit, UsersCreate } from './pages/Users'
import { LogsList } from './pages/Logs'
import Analytics from './pages/Analytics'
import TestPage from './pages/TestPage'

// Simple dark theme object
const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
}

// Custom Layout with dark mode toggle
const CustomLayout = (props: any) => (
  <Layout {...props} appBar={CustomAppBar} />
)

// Custom AppBar with dark mode toggle
const CustomAppBar = (props: any) => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('adminDarkMode')
    if (saved) setDarkMode(saved === 'true')
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('adminDarkMode', newMode.toString())
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('darkModeToggle'))
  }

  return (
    <AppBar {...props} userMenu={<UserMenu>
      <MenuItemLink to="/" primaryText="Dashboard" />
      <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={darkMode} 
            onChange={toggleDarkMode}
            style={{ margin: 0 }}
          />
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </label>
      </div>
    </UserMenu>} />
  )
}

// Custom data provider for our API structure
const customDataProvider = {
  getList: async (resource, params) => {
    try {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const skip = (page - 1) * perPage;
      const limit = perPage;
      
      const queryParams = new URLSearchParams({
        _start: skip.toString(),
        _end: (skip + limit).toString(),
        _sort: field,
        _order: order.toUpperCase()
      });
      
      const response = await fetch(`${API_BASE}/admin/${resource}?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const total = parseInt(response.headers.get('X-Total-Count') || '0');
      
      return {
        data: Array.isArray(data) ? data : [],
        total: total
      };
    } catch (error) {
      console.error(`Error fetching ${resource}:`, error);
      return {
        data: [],
        total: 0
      };
    }
  },
  
  getOne: async (resource, params) => {
    try {
      const response = await fetch(`${API_BASE}/admin/${resource}/${params.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Error fetching ${resource} ${params.id}:`, error);
      throw error;
    }
  },
  
  create: async (resource, params) => {
    try {
      const response = await fetch(`${API_BASE}/admin/${resource}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params.data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Error creating ${resource}:`, error);
      throw error;
    }
  },
  
  update: async (resource, params) => {
    try {
      const response = await fetch(`${API_BASE}/admin/${resource}/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(params.data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Error updating ${resource} ${params.id}:`, error);
      throw error;
    }
  },
  
  delete: async (resource, params) => {
    try {
      const response = await fetch(`${API_BASE}/admin/${resource}/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return { data: { id: params.id } as any };
    } catch (error) {
      console.error(`Error deleting ${resource} ${params.id}:`, error);
      throw error;
    }
  },
  
  getMany: async (resource, params) => {
    try {
      const ids = params.ids.join(',');
      const response = await fetch(`${API_BASE}/admin/${resource}?ids=${ids}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error(`Error fetching many ${resource}:`, error);
      return { data: [] };
    }
  },
  
  getManyReference: async (resource, params) => {
    try {
      const { target, id } = params;
      const response = await fetch(`${API_BASE}/admin/${resource}?${target}=${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const total = parseInt(response.headers.get('X-Total-Count') || '0');
      
      return {
        data: Array.isArray(data) ? data : [],
        total: total
      };
    } catch (error) {
      console.error(`Error fetching many reference ${resource}:`, error);
      return { data: [], total: 0 };
    }
  },
  
  updateMany: async (resource, params) => {
    try {
      const promises = params.ids.map(id => 
        fetch(`${API_BASE}/admin/${resource}/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(params.data)
        })
      );
      
      await Promise.all(promises);
      return { data: params.ids as any };
    } catch (error) {
      console.error(`Error updating many ${resource}:`, error);
      throw error;
    }
  },
  
  deleteMany: async (resource, params) => {
    try {
      const promises = params.ids.map(id => 
        fetch(`${API_BASE}/admin/${resource}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        })
      );
      
      await Promise.all(promises);
      return { data: params.ids as any };
    } catch (error) {
      console.error(`Error deleting many ${resource}:`, error);
      throw error;
    }
  }
};

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    console.log('App component mounted')
    const saved = localStorage.getItem('adminDarkMode')
    if (saved) setDarkMode(saved === 'true')
  }, [])

  // Listen for dark mode changes from the AppBar
  useEffect(() => {
    const handleDarkModeChange = () => {
      const saved = localStorage.getItem('adminDarkMode')
      setDarkMode(saved === 'true')
    }

    // Listen for storage changes
    window.addEventListener('storage', handleDarkModeChange)
    
    // Also listen for custom events
    window.addEventListener('darkModeToggle', handleDarkModeChange)

    return () => {
      window.removeEventListener('storage', handleDarkModeChange)
      window.removeEventListener('darkModeToggle', handleDarkModeChange)
    }
  }, [])

  return (
    <Admin 
      dashboard={Dashboard} 
      dataProvider={customDataProvider}
      layout={CustomLayout}
      theme={darkMode ? darkTheme : undefined}
    >
      <Resource name="docs" list={DocumentsList} create={DocumentsCreate} />
      <Resource name="users" list={UsersList} edit={UsersEdit} create={UsersCreate} />
      <Resource name="logs" list={LogsList} />
      <Resource name="analytics" list={Analytics} />
      <Resource name="test" list={TestPage} />
    </Admin>
  )
}
