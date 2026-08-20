import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '../services/api'

export type AuthUser = {
  id?: number
  name?: string
  email?: string
  document?: string
}

export type RegisterPayload = {
  // personType: 'PF' | 'PJ'
  //   name: string
  //   tradingName?: string
  //   email: string
  //   phone: string
  //   document: string
  //   password: string
  //   zipCode: string
  //   address: string
  //   number: string
  //   complement?: string
  //   neighborhood: string
  //   city: string
  // state: string
}

interface WebHookContextValue {
//   user: AuthUser | null
  // token: string | null
  // setToken: React.Dispatch<React.SetStateAction<string | null>>
  // isAuthenticated: boolean
  // isLoading: boolean
  // setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  // login: (document: string, password: string) => Promise<void>
  // register: (payload: RegisterPayload) => Promise<void>
  // logout: () => void
}

const WebHookContext = createContext<WebHookContextValue | undefined>(undefined)

export function WebHookProvider({ children }: { children: ReactNode }) {
  // const [token, setToken] = useState<string | null>(null)
  // const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   const storedToken = localStorage.getItem('@BaaS:token')
  //   const storedUser = localStorage.getItem('@BaaS:user')

  //   if (storedToken) {
  //     setToken(storedToken)
  //     api.defaults.headers.common.Authorization = `Bearer ${storedToken}`
  //   }

  //   if (storedUser) {
  //     try {
  //       setUser(JSON.parse(storedUser))
  //     } catch {
  //       localStorage.removeItem('@BaaS:user')
  //     }
  //   }

  //   setIsLoading(false)
  // }, [])

 
  const value = useMemo<WebHookContextValue>(() => ({
    
  }), [])

  return <WebHookContext.Provider value={value}>{children}</WebHookContext.Provider>
}

export function useAuth() {
  const context = useContext(WebHookContext)

  if (!context) {
    throw new Error('useAuth must be used within an WebHookProvider')
  }

  return context
}
