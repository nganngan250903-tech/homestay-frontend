import { useCallback, useState } from 'react'
import './App.css'
import AppRoutes from './routes/AppRoutes'
import { clearStoredAuth, readStoredAuth, saveStoredAuth } from './services/authStorage'

function App() {
  const [auth, setAuth] = useState(readStoredAuth)

  const login = useCallback((loginData) => {
    saveStoredAuth(loginData)
    setAuth(loginData)
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setAuth(null)
  }, [])

  return <AppRoutes auth={auth} onLogin={login} onLogout={logout} />
}

export default App
