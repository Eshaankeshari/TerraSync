import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      const { user, token } = JSON.parse(stored)
      setUser(user)
      setToken(token)
    }
  }, [])

  function saveAuth(nextUser, nextToken) {
    setUser(nextUser)
    setToken(nextToken)
    localStorage.setItem('auth', JSON.stringify({ user: nextUser, token: nextToken }))
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Login failed')
    const data = await res.json()
    saveAuth(data.user, data.token)
  }

  async function register(name, email, password) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    if (!res.ok) throw new Error('Register failed')
    const data = await res.json()
    saveAuth(data.user, data.token)
  }

  function logout() {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
  }

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, authHeaders, API_URL }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
