import React, { useState } from 'react';
import { useDashboardStore } from '../../store/useDashboardStore';

const CreateDashboard: React.FC = () => {
  const [dashboardName, setDashboardName] = useState('');
  const { createDashboard, isLoading } = useDashboardStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardName.trim()) return;

    const success = await createDashboard(dashboardName.trim());
    if (success) {
      setDashboardName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Create New Dashboard
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="dashboardName" className="block text-sm font-medium text-gray-700 mb-1">
            Dashboard Name
          </label>
          <input
            type="text"
            id="dashboardName"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="Enter dashboard name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !dashboardName.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Dashboard'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <span className="mr-2">✅</span>
          Dashboard will be created with edit mode enabled
        </p>
        <p className="flex items-center mt-1">
          <span className="mr-2">✅</span>
          Auto-save is enabled by default
        </p>
      </div>
    </div>
  );
};

export default CreateDashboard;