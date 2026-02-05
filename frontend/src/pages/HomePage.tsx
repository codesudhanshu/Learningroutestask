import { Link } from 'react-router-dom'
import { useDashboardStore } from '../store/useDashboardStore'

const HomePage = () => {
  const { user, dashboards } = useDashboardStore()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📊 Welcome to Dashboard Builder
        </h1>
        <p className="text-xl text-gray-600">
          {user ? `Hello, ${user.name}!` : 'Create amazing data visualizations'}
        </p>
      </div>

      {user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-4">
              <Link
                to="/dashboard"
                className="block w-full btn btn-primary text-center py-3"
              >
                🚀 Go to Dashboard
              </Link>
              {/* <button
                onClick={() => useDashboardStore.getState().createDashboard('New Dashboard')}
                className="w-full btn btn-secondary py-3"
              >
                ➕ Create New Dashboard
              </button> */}
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Your Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Dashboards</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboards.length}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Account</p>
                <p className="text-lg font-semibold text-green-600">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Please Login to Continue
            </h2>
            <div className="space-y-4">
              <Link
                to="/login"
                className="block w-full btn btn-primary py-3"
              >
                🔐 Login to Your Account
              </Link>
              <Link
                to="/register"
                className="block w-full btn btn-secondary py-3"
              >
                📝 Create New Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage