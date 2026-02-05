import { Navigate, Outlet } from 'react-router-dom'
import { useDashboardStore } from '../../store/useDashboardStore'
import Header from './Header'

const ProtectedRoute = () => {
  const { user } = useDashboardStore()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </>
  )
}

export default ProtectedRoute