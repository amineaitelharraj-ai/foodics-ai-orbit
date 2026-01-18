import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
  ISignUpResult
} from 'amazon-cognito-identity-js'

const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || ''
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || ''

const poolData = {
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID
}

let userPool: CognitoUserPool | null = null

function getUserPool(): CognitoUserPool {
  if (!userPool && COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID) {
    userPool = new CognitoUserPool(poolData)
  }
  if (!userPool) {
    throw new Error('Cognito configuration is missing. Please set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID')
  }
  return userPool
}

export interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface ConfirmSignUpData {
  email: string
  code: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthUser {
  email: string
  name?: string
  sub: string
}

export const cognitoAuth = {
  signUp(data: SignUpData): Promise<ISignUpResult> {
    return new Promise((resolve, reject) => {
      const pool = getUserPool()
      
      const attributeList: CognitoUserAttribute[] = [
        new CognitoUserAttribute({ Name: 'email', Value: data.email })
      ]
      
      if (data.name) {
        attributeList.push(new CognitoUserAttribute({ Name: 'name', Value: data.name }))
      }

      pool.signUp(
        data.email,
        data.password,
        attributeList,
        [],
        (err, result) => {
          if (err) {
            reject(err)
            return
          }
          if (result) {
            resolve(result)
          } else {
            reject(new Error('Sign up failed'))
          }
        }
      )
    })
  },

  confirmSignUp(data: ConfirmSignUpData): Promise<string> {
    return new Promise((resolve, reject) => {
      const pool = getUserPool()
      
      const cognitoUser = new CognitoUser({
        Username: data.email,
        Pool: pool
      })

      cognitoUser.confirmRegistration(data.code, true, (err, result) => {
        if (err) {
          reject(err)
          return
        }
        resolve(result)
      })
    })
  },

  signIn(data: SignInData): Promise<AuthTokens> {
    return new Promise((resolve, reject) => {
      const pool = getUserPool()
      
      const cognitoUser = new CognitoUser({
        Username: data.email,
        Pool: pool
      })

      const authDetails = new AuthenticationDetails({
        Username: data.email,
        Password: data.password
      })

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          const tokens: AuthTokens = {
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
            refreshToken: session.getRefreshToken().getToken()
          }
          localStorage.setItem('authTokens', JSON.stringify(tokens))
          resolve(tokens)
        },
        onFailure: (err) => {
          reject(err)
        },
        newPasswordRequired: () => {
          reject(new Error('New password required. Please contact support.'))
        }
      })
    })
  },

  signOut(): void {
    try {
      const pool = getUserPool()
      const cognitoUser = pool.getCurrentUser()
      if (cognitoUser) {
        cognitoUser.signOut()
      }
    } catch (e) {
      // Pool not configured, just clear local storage
    }
    localStorage.removeItem('authTokens')
  },

  getCurrentSession(): Promise<CognitoUserSession> {
    return new Promise((resolve, reject) => {
      const pool = getUserPool()
      const cognitoUser = pool.getCurrentUser()
      
      if (!cognitoUser) {
        reject(new Error('No user logged in'))
        return
      }

      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err) {
          reject(err)
          return
        }
        if (session && session.isValid()) {
          resolve(session)
        } else {
          reject(new Error('Session is invalid'))
        }
      })
    })
  },

  async getTokens(): Promise<AuthTokens | null> {
    try {
      const session = await this.getCurrentSession()
      return {
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken()
      }
    } catch {
      const stored = localStorage.getItem('authTokens')
      if (stored) {
        return JSON.parse(stored)
      }
      return null
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const session = await this.getCurrentSession()
      const payload = session.getIdToken().decodePayload()
      return {
        email: payload.email,
        name: payload.name,
        sub: payload.sub
      }
    } catch {
      return null
    }
  },

  isConfigured(): boolean {
    return !!(COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID)
  },

  forgotPassword(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const pool = getUserPool()
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: pool
      })

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve()
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  },

  confirmPassword(email: string, code: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const pool = getUserPool()
      
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: pool
      })

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve()
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }
}
