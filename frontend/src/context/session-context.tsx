import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type Session = {
  token: string
  tokenType: string
}

type SessionContextValue = {
  session: Session | null
  isLoading: boolean
  setSession: (session: Session) => void
  clearSession: () => void
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined)

const STORAGE_KEYS = {
  token: "access_token",
  tokenType: "token_type",
} as const

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSessionState] = useState<Session | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.token)
    if (!storedToken) {
      setIsLoaded(true)
      return
    }

    const storedTokenType = localStorage.getItem(STORAGE_KEYS.tokenType) ?? "bearer"
    setSessionState({ token: storedToken, tokenType: storedTokenType })
    setIsLoaded(true)
  }, [])

  const setSession = useCallback((value: Session) => {
    localStorage.setItem(STORAGE_KEYS.token, value.token)
    localStorage.setItem(STORAGE_KEYS.tokenType, value.tokenType)
    setSessionState(value)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.tokenType)
    setSessionState(null)
  }, [])

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoading: !isLoaded,
      setSession,
      clearSession,
    }),
    [session, isLoaded, setSession, clearSession],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}
