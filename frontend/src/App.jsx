import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import Toast from './components/common/Toast'
import { useAuthStore } from './stores/authStore'

function App() {
  const refreshSession = useAuthStore((state) => state.refreshSession)
  useEffect(() => { refreshSession() }, [refreshSession])
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
      <Toast />
    </BrowserRouter>
  )
}

export default App
