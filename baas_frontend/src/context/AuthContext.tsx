import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../services/api'

export type AuthUser = {
  id?: number
  name?: string
  email?: string
  document?: string
}

export type RegisterPayload = {
  personType: 'PF' | 'PJ'
  name: string
  tradingName?: string
  email: string
  phone: string
  document: string
  password: string
  zipCode: string
  address: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (document: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('@BaaS:token')
    const storedUser = localStorage.getItem('@BaaS:user')

    if (storedToken) {
      setToken(storedToken)
      api.defaults.headers.common.Authorization = `Bearer ${storedToken}`
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('@BaaS:user')
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`
      localStorage.setItem('@BaaS:token', token)
      return
    }

    delete api.defaults.headers.common.Authorization
    localStorage.removeItem('@BaaS:token')
  }, [token])

  const persistUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser)

    if (nextUser) {
      localStorage.setItem('@BaaS:user', JSON.stringify(nextUser))
      return
    }

    localStorage.removeItem('@BaaS:user')
  }, [])

  const login = useCallback(async (document: string, password: string) => {
    const cleanedDocument = document.replace(/\D/g, '')

    const response = await api.post('/auth/login', {
      document: cleanedDocument,
      password,
    })

    const nextToken = response.data.access_token as string
    const nextUser = (response.data.user as AuthUser) ?? null

    setToken(nextToken)
    persistUser(nextUser)
  }, [persistUser])

  const register = useCallback(async (payload: RegisterPayload) => {
    const cleanedDocument = payload.document.replace(/\D/g, '')
    const cleanedPhone = payload.phone.replace(/\D/g, '')
    const cleanedZipCode = payload.zipCode.replace(/\D/g, '')

    await api.post('/auth/register', {
      ...payload,
      document: cleanedDocument,
      phone: cleanedPhone,
      zipCode: cleanedZipCode,
    })
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    persistUser(null)
  }, [persistUser])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
  }), [isLoading, login, logout, register, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
