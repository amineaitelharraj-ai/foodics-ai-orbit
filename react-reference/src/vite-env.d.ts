/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LABEEB_API_URL: string
  readonly VITE_COGNITO_USER_POOL_ID: string
  readonly VITE_COGNITO_CLIENT_ID: string
  readonly VITE_COGNITO_REGION: string
  readonly VITE_ENABLE_VOICE: string
  readonly VITE_ENABLE_CHARTS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
