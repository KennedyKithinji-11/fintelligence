import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'       // Global styles including Tailwind directives

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* AuthProvider wraps the ENTIRE app — every component can call useAuth() */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)