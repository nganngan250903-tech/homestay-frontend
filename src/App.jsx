import { useState } from 'react'
import './App.css'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import { clearStoredAuth, readStoredAuth, saveStoredAuth } from './services/authStorage'

function App() {
  const [auth, setAuth] = useState(readStoredAuth)

  const login = (loginData) => {
    saveStoredAuth(loginData)
    setAuth(loginData)
  }

  const logout = () => {
    clearStoredAuth()
    setAuth(null)
  }

  if (!auth) {
    return <AuthPage onLogin={login} />
  }

  return <DashboardPage auth={auth} onLogout={logout} />
}

export default App
