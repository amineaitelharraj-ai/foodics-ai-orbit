import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { cognitoAuth, AuthTokens, AuthUser } from '../services/cognito-auth'

interface AuthContextType {
  user: AuthUser | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name?: string) => Promise<void>
  confirmSignUp: (email: string, code: string) => Promise<void>
  signOut: () => void
  error: string | null
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isConfigured = cognitoAuth.isConfigured()

  useEffect(() => {
    const checkAuth = async () => {
      if (!isConfigured) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await cognitoAuth.getCurrentUser()
        const currentTokens = await cognitoAuth.getTokens()
        setUser(currentUser)
        setTokens(currentTokens)
      } catch {
        setUser(null)
        setTokens(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isConfigured])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const authTokens = await cognitoAuth.signIn({ email, password })
      setTokens(authTokens)
      const currentUser = await cognitoAuth.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await cognitoAuth.signUp({ email, password, name })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const confirmSignUp = async (email: string, code: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await cognitoAuth.confirmSignUp({ email, code })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Confirmation failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    cognitoAuth.signOut()
    setUser(null)
    setTokens(null)
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isLoading,
        isAuthenticated: !!user,
        isConfigured,
        signIn,
        signUp,
        confirmSignUp,
        signOut,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
