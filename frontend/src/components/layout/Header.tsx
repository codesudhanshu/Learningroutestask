import { Link, useNavigate } from 'react-router-dom'
import { useDashboardStore } from '../../store/useDashboardStore'

const Header = () => {
  const { user, logout, currentDashboard } = useDashboardStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl">📊</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard Builder</h1>
              <p className="text-sm text-gray-600">Create & Manage Data Visualizations</p>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {currentDashboard && (
              <div className="hidden md:block px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">
                  Editing: <span className="font-bold">{currentDashboard.name}</span>
                </span>
              </div>
            )}
            
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
            </nav>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header