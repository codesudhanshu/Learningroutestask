import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useDashboardStore } from './store/useDashboardStore'

import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage from './components/auth/Login'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'
import Register from './components/auth/Register'

// Import auth service
import { initializeAuth, getAuthToken, getUserId } from './api/authService'
// Import API function
import { getUserProfile } from './api/dashboardApi'

function App() {
  const { user, login } = useDashboardStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)
  
  // ✅ App load hone pe auth initialize karo
  useEffect(() => {
    const initAuth = async () => {
      initializeAuth()
      
      const token = getAuthToken()
      const userId = getUserId()
      
      if (token && userId && !user) {
        // Token hai but store mein user nahi hai (page refresh ke baad)
        setIsCheckingAuth(true)
        try {
          // Backend se user profile fetch karo
          const result = await getUserProfile()
          
          if (result.success && result.data) {
            // Store mein user set karo
            useDashboardStore.getState().user = result.data
            console.log('Auto-login successful')
          } else {
            // Invalid token, clear storage
            useDashboardStore.getState().logout()
          }
        } catch (error) {
          console.error('Auto-login failed:', error)
          // Offline mode: Local storage se basic data load karo
          const userName = localStorage.getItem('user_name') || 'User'
          const userEmail = localStorage.getItem('user_email') || 'user@example.com'
          
          useDashboardStore.setState({
            user: {
              id: userId,
              name: userName,
              email: userEmail
            }
          })
        } finally {
          setIsCheckingAuth(false)
        }
      }
    }
    
    initAuth()
  }, [])
  
  // ✅ Loading state show karo during auth check
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Restoring your session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <Register />
          } 
        />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/:id" element={<DashboardPage />} />
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App