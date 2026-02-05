import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDashboardStore } from '../store/useDashboardStore'
import DashboardList from '../components/dashboard/DashboardList'
import CreateDashboard from '../components/dashboard/CreateDashboard'
import WidgetToolbar from '../components/widgets/WidgetToolbar'
import DashboardGrid from '../components/layout/DashboardGrid'

// DashboardPage.tsx
const DashboardPage = () => {
  const { id } = useParams()
  const { 
    currentDashboard, 
    loadDashboard, 
    loadDashboards,
    dashboardsLoaded,
    isLoading 
  } = useDashboardStore()

  useEffect(() => {
    // ✅ सिर्फ एक बार load करें जब component mount हो
    if (!dashboardsLoaded && !isLoading) {
      loadDashboards();
    }
  }, [dashboardsLoaded, isLoading, loadDashboards]);

  useEffect(() => {
    // ✅ सिर्फ तब load करें जब id change हो और current dashboard अलग हो
    if (id && currentDashboard?.id !== id && !isLoading) {
      loadDashboard(id);
    }
  }, [id, currentDashboard?.id, isLoading, loadDashboard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <CreateDashboard />
          <DashboardList />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentDashboard ? (
            <>
              <WidgetToolbar />
              
              {currentDashboard.widgets.length === 0 ? (
                <div className="card p-12 text-center">
                  <div className="text-7xl mb-6">📊</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    No widgets yet
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Add widgets from the toolbar above to start building your dashboard
                  </p>
                  <div className="flex justify-center gap-3">
                    {['bar', 'line', 'treemap', 'scatter'].map((type) => (
                      <button
                        key={type}
                        onClick={() => useDashboardStore.getState().addWidget({
                          type: type as any,
                          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
                          dataSource: type,
                          position: { x: 0, y: 0, w: 4, h: 3 },
                          config: {},
                        })}
                        className="btn btn-primary"
                      >
                        Add {type} chart
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <DashboardGrid widgets={currentDashboard.widgets} />
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-7xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Select or Create a Dashboard
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Choose a dashboard from the list on the left or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage