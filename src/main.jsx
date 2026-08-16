import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "./components/ui/provider"
import './index.css'
import App from './App.jsx'
import { Toaster } from './components/ui/toaster'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider>
     <Toaster />
      <App />
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)