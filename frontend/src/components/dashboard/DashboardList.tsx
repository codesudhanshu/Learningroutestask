import React, { useEffect } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import type { Dashboard } from '../../types/dashboard';
import Swal from 'sweetalert2';

const DashboardList: React.FC = () => {
  const { 
    dashboards, 
    currentDashboard, 
    selectDashboard, 
    deleteDashboard, 
    loadDashboards,
    dashboardsLoaded,
    dashboardsLoading,
    user 
  } = useDashboardStore();

  useEffect(() => {
    // ✅ Only load dashboards if user exists AND dashboards haven't been loaded yet
    if (user && !dashboardsLoaded && !dashboardsLoading) {
      console.log('🔄 DashboardList: Loading dashboards...');
      loadDashboards();
    }
  }, [user, dashboardsLoaded, dashboardsLoading, loadDashboards]);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSelectDashboard = (dashboard: Dashboard) => {
    // ✅ Validate dashboard ID before selecting
    if (!dashboard._id) {
      console.error('❌ Cannot select dashboard: ID is missing');
      return;
    }
    selectDashboard(dashboard); // ✅ Pass the entire dashboard object
  };

  const handleDeleteDashboard = (e: React.MouseEvent, dashboard: Dashboard) => {
  e.stopPropagation();
  
  // ✅ Get ID from dashboard object (handles both id and _id)
  const dashboardId = dashboard.id || dashboard._id;
  if (!dashboardId) {
    console.error('❌ Cannot delete: Dashboard ID is missing');
    Swal.fire({
      icon: 'error',
      title: 'Cannot Delete',
      text: 'Dashboard ID is missing',
    });
    return;
  }
  
  console.log('🗑️ Deleting dashboard with ID:', dashboardId);
  deleteDashboard(dashboardId);
};

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-600">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-lg font-medium mb-2">Authentication Required</p>
        <p className="text-sm">Please login to view your dashboards</p>
      </div>
    );
  }

  if (dashboardsLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Your Dashboards</h2>
          <p className="text-sm text-gray-600 mt-1">
            Select a dashboard to view or edit
          </p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading dashboards...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Your Dashboards</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a dashboard to view or edit
            </p>
          </div>
          {dashboards.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {dashboards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-medium text-gray-700 mb-2">No dashboards yet</p>
            <p className="text-sm text-gray-500 mb-4">Create your first dashboard to get started</p>
            <div className="text-3xl animate-bounce">👇</div>
          </div>
        ) : (
          <div className="space-y-3">
            {dashboards.map((dashboard: Dashboard) => (
              <div
                key={dashboard._id || `dashboard-${Math.random()}`}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                  currentDashboard?.id === dashboard._id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => handleSelectDashboard(dashboard)} // ✅ Pass dashboard object, not just id
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {dashboard.name || 'Unnamed Dashboard'}
                      </h3>
                      {dashboard.isLocked && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex-shrink-0">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {/* <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                        {dashboard.widgets?.length || 0} widget{(dashboard.widgets?.length || 0) !== 1 ? 's' : ''}
                      </span> */}
                      
                      {dashboard.createdAt && (
                        <span className="text-gray-500" title={`Created: ${formatDate(dashboard.createdAt)}`}>
                          Created {formatDate(dashboard.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {dashboard.updatedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Updated {formatDate(dashboard.updatedAt)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={(e) => handleDeleteDashboard(e, dashboard)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      title="Delete dashboard"
                      aria-label={`Delete dashboard ${dashboard.name}`}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {dashboard.description && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                    {dashboard.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {dashboards.length > 0 && (
        <div className="px-6 pb-4 border-t border-gray-100 pt-4">
          <div className="text-xs text-gray-500 text-center">
            Click on a dashboard to select it
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardList;