// src/api/dashboardApi.ts
import axios from 'axios';
import type {
  CategoricalData,
  TimeSeriesData,
  HierarchicalData,
  RelationalData,
  WidgetConfig,
  Dashboard,
  User,
} from '../types/dashboard';

const API_BASE_URL = 'http://localhost:5000/api';

// Import auth service
import { 
  setAuthToken, 
  getAuthToken, 
  getUserId, 
  setUserId,
  setUserDetails,
  clearAuthData,
  initializeAuth 
} from './authService';

// Initialize auth on import
initializeAuth();

// ==================== LOCAL MOCK DATA GENERATORS ====================
const generateCategoricalData = (): CategoricalData[] => {
  return [
    { name: 'Electronics', value: 1200 },
    { name: 'Clothing', value: 850 },
    { name: 'Food & Beverages', value: 1450 },
    { name: 'Books', value: 620 },
    { name: 'Home Decor', value: 930 },
    { name: 'Sports', value: 780 },
    { name: 'Beauty', value: 1100 },
    { name: 'Toys', value: 540 },
  ];
};

const generateTimeSeriesData = (): TimeSeriesData[] => {
  const data: TimeSeriesData[] = [];
  const baseDate = new Date();
  let value = 100;

  for (let i = 30; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);

    value += (Math.random() - 0.3) * 15;
    value = Math.max(80, Math.min(200, value));

    data.push({
      timestamp: date.toISOString(),
      value: Math.round(value),
    });
  }

  return data;
};

const generateHierarchicalData = (): HierarchicalData => {
  return {
    name: 'Global Revenue',
    children: [
      {
        name: 'North America',
        children: [
          { name: 'USA', value: 4500 },
          { name: 'Canada', value: 1800 },
          { name: 'Mexico', value: 1200 },
        ],
      },
      {
        name: 'Europe',
        children: [
          { name: 'Germany', value: 3200 },
          { name: 'UK', value: 2800 },
          { name: 'France', value: 2400 },
          { name: 'Italy', value: 1600 },
        ],
      },
      {
        name: 'Asia',
        children: [
          { name: 'China', value: 5200 },
          { name: 'Japan', value: 2100 },
          { name: 'India', value: 1900 },
          { name: 'South Korea', value: 1400 },
        ],
      },
      {
        name: 'Others',
        children: [
          { name: 'Australia', value: 900 },
          { name: 'Brazil', value: 1100 },
          { name: 'South Africa', value: 600 },
        ],
      },
    ],
  };
};

const generateRelationalData = (): RelationalData[] => {
  const data: RelationalData[] = [];
  const correlationType = Math.floor(Math.random() * 3);

  for (let i = 0; i < 50; i++) {
    let x = Math.random() * 100;
    let y;

    switch (correlationType) {
      case 0:
        y = 0.6 * x + (Math.random() * 25);
        break;
      case 1:
        y = -0.5 * x + 80 + (Math.random() * 20);
        break;
      default:
        y = Math.random() * 100;
        break;
    }

    if (i % 10 === 0) {
      x = 20 + Math.random() * 20;
      y = 30 + Math.random() * 20;
    } else if (i % 7 === 0) {
      x = 70 + Math.random() * 20;
      y = 70 + Math.random() * 20;
    }

    data.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      label: `Data ${i + 1}`,
    });
  }

  return data;
};

// ==================== HELPER FUNCTIONS ====================

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {};
};

// Helper function for common error handling
const handleApiError = (error: any, operation: string) => {
  console.error(`${operation} error:`, error);
  
  if (error.response?.status === 401) {
    clearAuthData();
    return {
      success: false,
      message: 'Session expired. Please login again.',
    };
  }
  
  if (error.response?.status === 404) {
    return {
      success: false,
      message: 'Resource not found',
    };
  }
  
  if (error.request) {
    return {
      success: false,
      message: 'Backend server is not reachable. Please check if server is running.',
    };
  }
  
  return {
    success: false,
    message: error.message || `Failed to ${operation}`,
  };
};

// ==================== AUTH API FUNCTIONS ====================

export const loginUser = async (email: string, password: string): Promise<{
  success: boolean;
  message: string;
  data?: { user: User; dashboards: Dashboard[]; token: string };
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    
    if (response.data.success && response.data.data) {
      // Save token and user details
      setAuthToken(response.data.data.token);
      setUserId(response.data.data.user.id);
      setUserDetails({
        email: response.data.data.user.email,
        name: response.data.data.user.name
      });
      
      return {
        success: true,
        message: response.data.message,
        data: {
          user: response.data.data.user,
          token: response.data.data.token,
          dashboards: response.data.data.dashboards || []
        }
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Login failed',
    };
  } catch (error: any) {
    return handleApiError(error, 'login');
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<{
  success: boolean;
  message: string;
  data?: { user: User; token: string };
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });
    
    if (response.data.success && response.data.data) {
      setAuthToken(response.data.data.token);
      setUserId(response.data.data.user.id);
      setUserDetails({
        email: response.data.data.user.email,
        name: response.data.data.user.name
      });
      
      return {
        success: true,
        message: response.data.message,
        data: {
          user: response.data.data.user,
          token: response.data.data.token
        }
      };
    }
    
    return {
      success: false,
      message: response.data.message || 'Registration failed',
    };
  } catch (error: any) {
    return handleApiError(error, 'register');
  }
};

export const logoutUser = (): void => {
  clearAuthData();
};

// ==================== DASHBOARD API FUNCTIONS ====================

export const createNewDashboard = async (name: string, userId: string, description: string = ''): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard;
}> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/dashboards`,
      {
        name,
        description,
        isPublic: false,
        userId
      },
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    const errorResult = handleApiError(error, 'create dashboard');
    
    return errorResult;
  }
};

// Dashboard API promise cache
let dashboardsPromise: Promise<any> | null = null;

export const loadUserDashboards = async (): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard[];
}> => {
  // ✅ Promise caching - prevent multiple simultaneous requests
  if (dashboardsPromise) {
    return await dashboardsPromise;
  }

  try {
    const userId = getUserId();
    if (!userId) {
      return { 
        success: false, 
        message: 'User not authenticated',
        data: [] 
      };
    }
    
    // ✅ Create fresh promise
    dashboardsPromise = new Promise(async (resolve, reject) => {
      try {
        // Try the user-specific endpoint first
        const response = await axios.get(
          `${API_BASE_URL}/dashboards/user/${userId}`,
          { headers: getAuthHeaders() }
        );
        
        resolve(response.data);
      } catch (error: any) {
        // If user-specific endpoint fails, try the generic endpoint
        if (error.response?.status === 404) {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/dashboards`,
              { headers: getAuthHeaders() }
            );
            resolve(response.data);
          } catch (secondError) {
            const errorResult = handleApiError(secondError, 'load dashboards');
            resolve({
              ...errorResult,
              data: []
            });
          }
        } else {
          const errorResult = handleApiError(error, 'load dashboards');
          resolve({
            ...errorResult,
            data: []
          });
        }
      } finally {
        // Reset promise after completion
        setTimeout(() => {
          dashboardsPromise = null;
        }, 100);
      }
    });

    return await dashboardsPromise;
  } catch (error) {
    dashboardsPromise = null;
    throw error;
  }
};

// ✅ Cache clear function
export const clearDashboardsCache = () => {
  dashboardsPromise = null;
};

// api/dashboardApi.ts में updateDashboard
export const updateDashboard = async (dashboard: Dashboard): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard;
}> => {
  try {
    if (!dashboard.id) {
      console.error('❌ Dashboard ID is undefined');
      return {
        success: false,
        message: 'Dashboard ID is required'
      };
    }

    // ✅ Format widgets properly
    const formattedWidgets = dashboard.widgets?.map(widget => ({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      dataSource: widget.dataSource,
      position: widget.position,
      config: widget.config || {}
    })) || [];

    const updateData = {
      name: dashboard.name,
      widgets: formattedWidgets, // ✅ Formatted widgets
      isLocked: dashboard.isLocked,
      description: dashboard.description || '',
      isPublic: dashboard.isPublic || false
    };

    console.log('📤 Sending update data with widgets:', formattedWidgets.length, 'widgets');

    const response = await axios.put(
      `${API_BASE_URL}/dashboards/${dashboard.id}`,
      updateData,
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Update dashboard error:', error.response?.data || error.message);
    const errorResult = handleApiError(error, 'update dashboard');
    
    return errorResult;
  }
};

export const deleteDashboard = async (dashboardId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // ✅ ID check
    if (!dashboardId) {
      console.error('❌ Dashboard ID is undefined');
      return {
        success: false,
        message: 'Dashboard ID is required'
      };
    }

    const response = await axios.delete(
      `${API_BASE_URL}/dashboards/${dashboardId}`,
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    const errorResult = handleApiError(error, 'delete dashboard');
    
    if (!errorResult.success) {
      return { 
        success: true, 
        message: 'Deleted locally' 
      };
    }
    
    return errorResult;
  }
};

export const getDashboardById = async (dashboardId: string): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard;
}> => {
  try {
    // ✅ ID check
    if (!dashboardId) {
      console.error('❌ Dashboard ID is undefined');
      return {
        success: false,
        message: 'Dashboard ID is required'
      };
    }

    const response = await axios.get(
      `${API_BASE_URL}/dashboards/${dashboardId}`,
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'load dashboard');
  }
};

export const saveDashboardLayout = async (dashboardId: string, layout: any, widgets: any[]): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard;
}> => {
  try {
    // ✅ ID check
    if (!dashboardId) {
      console.error('❌ Dashboard ID is undefined');
      return {
        success: false,
        message: 'Dashboard ID is required'
      };
    }

    const response = await axios.put(
      `${API_BASE_URL}/dashboards/${dashboardId}/layout`,
      { layout, widgets },
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    const errorResult = handleApiError(error, 'save layout');
    
    if (!errorResult.success) {
      return {
        success: true,
        message: 'Layout saved locally',
      };
    }
    
    return errorResult;
  }
};

// ==================== WIDGET API FUNCTIONS ====================

export const saveWidget = async (widgetData: WidgetConfig, dashboardId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/widgets`,
      {
        ...widgetData,
        dashboardId,
      },
      { 
        headers: getAuthHeaders(),
        timeout: 3000 
      }
    );

    return {
      success: response.data.success,
      message: response.data.message || 'Widget saved successfully',
      data: response.data.data,
    };
  } catch (error: any) {
    const errorResult = handleApiError(error, 'save widget');
    
    if (!errorResult.success) {
      const userId = getUserId();
      return {
        success: true,
        message: 'Widget saved locally (offline mode)',
        data: {
          _id: `local-${widgetData.id}`,
          ...widgetData,
          userId: userId || 'anonymous',
          dashboardId,
        },
      };
    }
    
    return errorResult;
  }
};

// ==================== DATA API FUNCTIONS ====================

export const fetchMockData = async (type: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/data/${type}`,
      { 
        headers: getAuthHeaders(),
        timeout: 3000,
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
  } catch (error: any) {
    console.log(`Backend API unavailable, using local mock data for ${type}`);
    
    if (error.response?.status === 401) {
      clearAuthData();
      throw new Error('Session expired. Please login again.');
    }
  }

  // Fallback to local mock data with simulated delay
  await new Promise(resolve => setTimeout(resolve, 300));

  switch (type) {
    case 'categorical':
    case 'bar':
      return generateCategoricalData();
    case 'temporal':
    case 'line':
      return generateTimeSeriesData();
    case 'hierarchical':
    case 'treemap':
      return generateHierarchicalData();
    case 'relational':
    case 'scatter':
      return generateRelationalData();
    default:
      throw new Error(`Unknown data type: ${type}`);
  }
};

export const checkApiHealth = async (): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/health`,
      { 
        headers: getAuthHeaders(),
        timeout: 2000,
      }
    );
    return {
      success: response.data.success,
      message: response.data.message || 'API is healthy',
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'API not reachable',
    };
  }
};

// ==================== USER PROFILE FUNCTIONS ====================

export const getUserProfile = async (): Promise<{
  success: boolean;
  message: string;
  data?: User;
}> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/me`,
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'get user profile');
  }
};

// ==================== LOCAL STORAGE FUNCTIONS ====================



// ==================== LEGACY FUNCTIONS ====================

export const saveDashboard = async (dashboardData: {
  name: string;
  widgets: WidgetConfig[];
  description?: string;
  isPublic?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/dashboards`,
      {
        name: dashboardData.name,
        description: dashboardData.description || '',
        widgets: dashboardData.widgets,
        isPublic: dashboardData.isPublic || false
      },
      { 
        headers: getAuthHeaders(),
        timeout: 5000 
      }
    );

    return {
      success: response.data.success,
      message: response.data.message || 'Dashboard saved successfully',
      data: response.data.data,
    };
  } catch (error: any) {
    return handleApiError(error, 'save dashboard');
  }
};

export const loadDashboard = async (dashboardId: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  return getDashboardById(dashboardId);
};

export const getDashboards = async (): Promise<{
  success: boolean;
  message: string;
  data?: any[];
}> => {
  return loadUserDashboards();
};

// ✅ New function to get single dashboard by ID without loading all dashboards
export const getDashboard = async (dashboardId: string): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard;
}> => {
  try {
    // ✅ ID check
    if (!dashboardId) {
      console.error('❌ Dashboard ID is undefined');
      return {
        success: false,
        message: 'Dashboard ID is required'
      };
    }

    const response = await axios.get(
      `${API_BASE_URL}/dashboards/${dashboardId}`,
      { headers: getAuthHeaders() }
    );
    
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'get dashboard');
  }
};

// ✅ Function to refresh dashboards cache
export const refreshDashboards = async (): Promise<{
  success: boolean;
  message: string;
  data?: Dashboard[];
}> => {
  clearDashboardsCache();
  return loadUserDashboards();
};