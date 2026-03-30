/// <reference types="vite/client" />

// Extend the Vite ImportMeta interface with your custom env variables
// Any variable prefixed with VITE_ is exposed to the browser bundle
interface ImportMetaEnv {
  readonly VITE_API_BASE: string     // e.g. "http://localhost:8000"
  readonly VITE_WS_BASE: string      // e.g. "ws://localhost:8000"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}