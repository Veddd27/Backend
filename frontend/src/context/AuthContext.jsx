/**
 * AuthContext — global "who is logged in?" state
 *
 * React Context lets you share data (like the current user) across
 * many components without passing props through every level.
 *
 * Usage anywhere in the app:
 *   const { user, login, logout } = useAuth()
 */

import { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first load, check if we already have a saved token
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await api.getCurrentUser()
        setUser(res.data)
      } catch {
        localStorage.removeItem('accessToken')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  async function login(email, password) {
    const res = await api.loginUser({ email, password })
    localStorage.setItem('accessToken', res.data.accessToken)
    setUser(res.data.user)
    return res
  }

  async function register(formData) {
    const res = await api.registerUser(formData)
    // After register, log them in automatically
    const loginRes = await api.loginUser({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    localStorage.setItem('accessToken', loginRes.data.accessToken)
    setUser(loginRes.data.user)
    return res
  }

  async function logout() {
    try {
      await api.logoutUser()
    } catch {
      // logout locally even if API fails
    }
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  async function refreshUser() {
    try {
      const res = await api.getCurrentUser()
      setUser(res.data)
      return res.data
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
