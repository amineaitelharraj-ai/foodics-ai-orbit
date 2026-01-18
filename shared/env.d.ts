/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LABEEB_API_URL?: string;
  readonly VITE_COGNITO_USER_POOL_ID?: string;
  readonly VITE_COGNITO_CLIENT_ID?: string;
  readonly VITE_SESSION_STORAGE_PREFIX?: string;
  // Allow string index for dynamic access
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
