import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';
import type { WidgetType } from '../../types/dashboard';
import Swal from 'sweetalert2';

const WidgetToolbar: React.FC = () => {
  const { 
    addWidget, 
    isEditing, 
    toggleEditMode, 
    unlockLayout,
    currentDashboard,
    getCurrentWidgets,
    getCurrentDashboardName
  } = useDashboardStore();

  const [lastAutoSave, setLastAutoSave] = useState<string>('');

  // Update last auto-save time
  useEffect(() => {
    if (currentDashboard) {
      setLastAutoSave(new Date(currentDashboard.updatedAt).toLocaleTimeString());
    }
  }, [currentDashboard]);

  const widgetTypes: { type: WidgetType; label: string; icon: string; description: string }[] = [
    { type: 'bar', label: 'Bar Chart', icon: '📊', description: 'Compare categories' },
    { type: 'line', label: 'Line Chart', icon: '📈', description: 'Show trends over time' },
    { type: 'treemap', label: 'Tree Map', icon: '🌳', description: 'Hierarchical data view' },
    { type: 'scatter', label: 'Scatter Plot', icon: '✨', description: 'Correlation analysis' },
  ];

  const handleAddWidget = (type: WidgetType) => {
    if (!currentDashboard) {
      Swal.fire({
        icon: 'warning',
        title: 'No Dashboard Selected',
        text: 'Please select or create a dashboard first',
      });
      return;
    }

    if (!isEditing) {
      Swal.fire({
        icon: 'warning',
        title: 'Layout Locked',
        text: 'Please unlock the layout to add widgets',
        showCancelButton: true,
        confirmButtonText: 'Unlock',
        cancelButtonText: 'Cancel',
       buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none',
            cancelButton: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 ml-2 focus:outline-none',
          },
      }).then((result) => {
        if (result.isConfirmed) {
          unlockLayout();
        }
      });
      return;
    }

    const widgets = getCurrentWidgets();
    const defaultConfig = {
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Chart`,
      dataSource: type,
      position: {
        x: (widgets.length * 2) % 12,
        y: Math.floor(widgets.length / 6) * 3,
        w: 4,
        h: 3,
      },
      config: {},
    };
    
    addWidget(defaultConfig);
  };

  const handleLockToggle = () => {
    if (!currentDashboard) {
      Swal.fire({
        icon: 'warning',
        title: 'No Dashboard Selected',
        text: 'Please select or create a dashboard first',
      });
      return;
    }

    if (isEditing) {
      // Locking layout
      Swal.fire({
        title: 'Lock Layout?',
        text: "Once locked, you won't be able to add, remove, or resize widgets",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, lock it!',
        cancelButtonText: 'Cancel',
        buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none',
            cancelButton: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 ml-2 focus:outline-none',
          },
      }).then((result) => {
        if (result.isConfirmed) {
          toggleEditMode();
        }
      });
    } else {
      // Unlocking layout
      unlockLayout();
    }
  };

  const handleClearDashboard = () => {
    if (!currentDashboard || getCurrentWidgets().length === 0) return;

    Swal.fire({
      title: 'Clear All Widgets?',
      text: "This will remove all widgets from the dashboard",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear all!',
      cancelButtonText: 'Cancel',
      buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none',
            cancelButton: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 ml-2 focus:outline-none',
          },
    }).then((result) => {
      if (result.isConfirmed) {
        useDashboardStore.getState().setLayout([]);
        Swal.fire({
          icon: 'success',
          title: 'Cleared!',
          text: 'All widgets have been removed',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const widgets = getCurrentWidgets();

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Dashboard Info */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {getCurrentDashboardName()}
            </h1>
            {currentDashboard && (
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center">
                  <span className="mr-1">📊</span>
                  {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
                </span>
                <span className="flex items-center">
                  <span className="mr-1">💾</span>
                  Auto-save: {lastAutoSave || 'Never'}
                </span>
                <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isEditing 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {isEditing ? '🔄 Editing Mode' : '🔒 Locked Mode'}
                </span>
              </div>
            )}
          </div>

          {/* Layout Controls */}
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            {widgets.length > 0 && (
              <button
                onClick={handleClearDashboard}
                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                disabled={!isEditing}
              >
                🗑️ Clear All
              </button>
            )}
            
            <button
              onClick={handleLockToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isEditing ? '🔒 Lock Layout' : '✏️ Unlock Layout'}
            </button>
          </div>
        </div>
      </div>

      {/* Widget Buttons */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Add Widgets {!isEditing && '(Unlock layout to add)'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {widgetTypes.map((widget) => (
            <button
              key={widget.type}
              onClick={() => handleAddWidget(widget.type)}
              disabled={!isEditing}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all ${
                isEditing
                  ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-200'
                  : 'bg-gray-100 cursor-not-allowed border border-gray-200'
              }`}
              title={isEditing ? widget.description : 'Unlock layout to add widgets'}
            >
              <span className="text-2xl mb-2">{widget.icon}</span>
              <span className="text-sm font-medium text-gray-700">{widget.label}</span>
              {!isEditing && (
                <span className="text-xs text-gray-500 mt-1">Locked</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      {currentDashboard && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${
                  isEditing ? 'bg-green-500' : 'bg-yellow-500'
                }`}></span>
                {isEditing ? 'Ready to edit' : 'Layout locked'}
              </span>
              <span className="flex items-center">
                <span className="mr-1">⏱️</span>
                Auto-saves every 2 seconds
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              Dashboard ID: {currentDashboard._id.slice(0, 8)}...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WidgetToolbar;