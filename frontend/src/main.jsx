import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ReactLenis } from 'lenis/react'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReactLenis root>
          <App />
        </ReactLenis>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

