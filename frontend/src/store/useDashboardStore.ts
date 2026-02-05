import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dashboard, WidgetConfig, User, DashboardState } from '../types/dashboard';
import { 
  saveDashboard, 
  loadUserDashboards, 
  createNewDashboard,
  deleteDashboard as apiDeleteDashboard,
  updateDashboard,
  loginUser,
  registerUser, 
  logoutUser,
  getDashboard, // ✅ Added this new function
  refreshDashboards // ✅ Added this new function
} from '../api/dashboardApi';
import Swal from 'sweetalert2';

interface DashboardStore extends DashboardState {
  // ✅ New states added
  dashboardsLoaded: boolean;
  dashboardsLoading: boolean;
  lastLoadTime: number | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Dashboard actions
  createDashboard: (name: string) => Promise<boolean>;
  loadDashboard: (dashboardId: string) => Promise<void>;
  loadDashboards: (forceRefresh?: boolean) => Promise<void>;
  deleteDashboard: (dashboardId: string) => Promise<void>;
  selectDashboard: (dashboard: Dashboard) => void;
  
  // Widget actions
  addWidget: (widget: Omit<WidgetConfig, 'id'>) => Promise<void>;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => Promise<void>;
  removeWidget: (id: string) => Promise<void>;
  setLayout: (widgets: WidgetConfig[]) => Promise<void>;
  
  // Layout actions
  toggleEditMode: () => void;
  lockLayout: () => void;
  unlockLayout: () => void;
  
  // Auto-save
  autoSave: () => void;
  
  // Helper getters
  getCurrentWidgets: () => WidgetConfig[];
  getCurrentDashboardName: () => string;
  getDashboardId: (dashboard: Dashboard | null) => string | null; // ✅ NEW HELPER
  
  // ✅ Cache clear function
  invalidateDashboardsCache: () => void;
  
  // ✅ Refresh function
  refreshDashboards: () => Promise<void>;
}

// Auto-save debounce
let autoSaveTimeout: any;

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      user: null,
      currentDashboard: null,
      dashboards: [],
      isEditing: true,
      isLoading: false,
      
      // ✅ New states initialized
      dashboardsLoaded: false,
      dashboardsLoading: false,
      lastLoadTime: null,

      // Helper getters
      getCurrentWidgets: () => {
        const { currentDashboard } = get();
        return currentDashboard?.widgets || [];
      },

      getCurrentDashboardName: () => {
        const { currentDashboard } = get();
        return currentDashboard?.name || 'No Dashboard Selected';
      },

      // ✅ NEW: Helper to get dashboard ID (handles both id and _id)
      getDashboardId: (dashboard: Dashboard | null) => {
        if (!dashboard) return null;
        return dashboard.id || dashboard._id || null;
      },

      // ✅ Cache invalidate function
      invalidateDashboardsCache: () => {
        set({
          dashboardsLoaded: false,
          lastLoadTime: null
        });
      },

      // ✅ Refresh function
      refreshDashboards: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          set({ dashboardsLoading: true });
          const result = await refreshDashboards();
          
          if (result.success) {
            set({ 
              dashboards: result.data || [],
              dashboardsLoaded: true,
              lastLoadTime: Date.now(),
              dashboardsLoading: false
            });
            console.log('✅ Dashboards refreshed successfully');
          }
        } catch (error) {
          console.error('❌ Failed to refresh dashboards:', error);
          set({ dashboardsLoading: false });
        }
      },

      // Auth actions (unchanged)
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const result = await loginUser(email, password);
          
          if (result.success && result.data?.user) {
            set({ 
              user: result.data.user,
              dashboards: result.data.dashboards || [],
              currentDashboard: null,
              isEditing: true,
              dashboardsLoaded: false,
              lastLoadTime: null
            });
            
            Swal.fire({
              icon: 'success',
              title: 'Login Successful!',
              text: `Welcome back, ${result.data.user.name}!`,
              timer: 2000,
              showConfirmButton: false
            });
            
            return true;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Login Failed',
              text: result.message || 'Invalid email or password',
            });
            return false;
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: 'Network error occurred. Please check backend connection.',
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });
          const result = await registerUser(name, email, password);
          
          if (result.success && result.data?.user) {
            set({ 
              user: result.data.user,
              dashboards: [],
              currentDashboard: null,
              isEditing: true,
              dashboardsLoaded: false,
              lastLoadTime: null
            });
            
            Swal.fire({
              icon: 'success',
              title: 'Registration Successful!',
              text: 'Your account has been created',
              timer: 2000,
              showConfirmButton: false
            });
            
            return true;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Registration Failed',
              text: result.message || 'Please try again',
            });
            return false;
          }
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: 'Please try again',
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        logoutUser();
        
        set({
          user: null,
          currentDashboard: null,
          dashboards: [],
          isEditing: true,
          dashboardsLoaded: false,
          dashboardsLoading: false,
          lastLoadTime: null
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Logged Out',
          text: 'You have been logged out successfully',
          timer: 1500,
          showConfirmButton: false
        });
      },

      // ✅ Optimized loadDashboards function with force refresh option
      loadDashboards: async (forceRefresh = false) => {
        const { user, dashboardsLoaded, lastLoadTime, dashboardsLoading } = get();
        
        if (!user) return;
        
        if (dashboardsLoading) {
          console.log('📊 Already loading dashboards, skipping...');
          return;
        }
        
        if (!forceRefresh) {
          const fiveMinutes = 5 * 60 * 1000;
          if (dashboardsLoaded && lastLoadTime && (Date.now() - lastLoadTime < fiveMinutes)) {
            console.log('📊 Dashboards already loaded recently, skipping...');
            return;
          }
        }
        
        try {
          set({ dashboardsLoading: true });
          console.log('📊 Loading dashboards from API...');
          
          const result = await loadUserDashboards();
          
          if (result.success) {
            set({ 
              dashboards: result.data || [],
              dashboardsLoaded: true,
              lastLoadTime: Date.now(),
              dashboardsLoading: false
            });
            console.log('✅ Dashboards loaded successfully');
          }
        } catch (error) {
          console.error('❌ Failed to load dashboards:', error);
          set({ dashboardsLoading: false });
        }
      },

      // ✅ Optimized loadDashboard function
      loadDashboard: async (dashboardId: string) => {
        if (!dashboardId) {
          console.error('❌ Cannot load dashboard: ID is undefined');
          return;
        }

        const { dashboards, dashboardsLoaded } = get();
        
        const cachedDashboard = dashboards.find(d => d.id === dashboardId);
        if (cachedDashboard) {
          console.log('📊 Dashboard found in cache');
          set({ 
            currentDashboard: cachedDashboard,
            isEditing: !cachedDashboard.isLocked
          });
          return;
        }
        
        if (dashboardsLoaded) {
          console.warn('⚠️ Dashboard not found in loaded dashboards');
          Swal.fire({
            icon: 'warning',
            title: 'Dashboard Not Found',
            text: 'The requested dashboard was not found',
          });
          return;
        }
        
        try {
          set({ isLoading: true });
          console.log(`📊 Loading single dashboard: ${dashboardId}`);
          
          const result = await getDashboard(dashboardId);
          
          if (result.success && result.data) {
            const dashboard = result.data;
            set({ 
              currentDashboard: dashboard,
              isEditing: !dashboard.isLocked
            });
            console.log('✅ Single dashboard loaded successfully');
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Dashboard Not Found',
              text: result.message || 'Dashboard not found',
            });
          }
        } catch (error) {
          console.error('❌ Failed to load dashboard:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to Load',
            text: 'Could not load dashboard',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      createDashboard: async (name: string) => {
        const user = get().user;
        if (!user) {
          Swal.fire({
            icon: 'error',
            title: 'Authentication Required',
            text: 'Please login to create dashboards',
          });
          return false;
        }

        try {
          set({ isLoading: true });
          const result = await createNewDashboard(name, user.id);
          
          if (result.data) {
            const backendId = result.data._id;
            if (!backendId) {
              console.error('❌ Created dashboard has no ID:', result.data);
              throw new Error('Dashboard created without ID');
            }
            
            console.log('✅ Dashboard created with ID:', backendId);
            
            const newDashboard: Dashboard = {
              _id: backendId,
              id: backendId,
              name: result.data.name,
              userId: result.data.userId || user.id,
              description: result.data.description || '',
              widgets: result.data.widgets || [],
              isLocked: result.data.isLocked || false,
              isPublic: result.data.isPublic || false,
              createdAt: result.data.createdAt || new Date().toISOString(),
              updatedAt: result.data.updatedAt || new Date().toISOString(),
            };
            
            set(state => ({
              dashboards: [newDashboard, ...state.dashboards],
              currentDashboard: newDashboard,
              isEditing: true,
              dashboardsLoaded: true,
              lastLoadTime: Date.now()
            }));
            
            Swal.fire({
              icon: 'success',
              title: 'Dashboard Created!',
              text: `"${name}" has been created`,
              timer: 1500,
              showConfirmButton: false
            });
            
            return true;
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Failed to Create',
              text: result.message || 'Could not create dashboard',
            });
            return false;
          }
        } catch (error) {
          console.error('❌ Create dashboard error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to Create',
            text: 'Could not create dashboard',
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteDashboard: async (dashboardId: string) => {
        if (!dashboardId) {
          console.error('❌ Cannot delete: Dashboard ID is undefined');
          Swal.fire({
            icon: 'error',
            title: 'Cannot Delete',
            text: 'Dashboard ID is missing',
          });
          return;
        }

        const result = await Swal.fire({
          title: 'Delete Dashboard?',
          html: '<span class="text-sm text-gray-600">This action cannot be undone!</span>',
          icon: 'warning',
          showCancelButton: true,
          buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none',
            cancelButton: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 ml-2 focus:outline-none',
          },
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
          try {
            console.log('🗑️ Deleting dashboard with ID:', dashboardId);
            const apiResult = await apiDeleteDashboard(dashboardId);
            
            if (apiResult.success) {
              set(state => ({
                dashboards: state.dashboards.filter(d => d.id !== dashboardId),
                currentDashboard: state.currentDashboard?.id === dashboardId ? null : state.currentDashboard,
                dashboardsLoaded: true,
                lastLoadTime: Date.now()
              }));
              
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Dashboard has been deleted.',
                timer: 1500,
                showConfirmButton: false
              });
            }
          } catch (error) {
            console.error('❌ Delete dashboard error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Failed to Delete',
              text: 'Could not delete dashboard',
            });
          }
        }
      },

      selectDashboard: (dashboard: Dashboard) => {
        set({ 
          currentDashboard: dashboard,
          isEditing: !dashboard.isLocked
        });
      },

      // ✅ FIXED: Widget actions with proper ID handling
      addWidget: async (widget: Omit<WidgetConfig, 'id'>) => {
        const { currentDashboard, user, getDashboardId } = get();
        if (!currentDashboard || !user) {
          Swal.fire({
            icon: 'warning',
            title: 'No Dashboard Selected',
            text: 'Please select or create a dashboard first',
          });
          return;
        }

        // ✅ Get dashboard ID using helper function
        const dashboardId = getDashboardId(currentDashboard);
        if (!dashboardId) {
          console.error('❌ Cannot add widget: Dashboard ID is missing');
          Swal.fire({
            icon: 'error',
            title: 'Cannot Add Widget',
            text: 'Dashboard ID is missing. Please refresh the page.',
          });
          return;
        }

        const newWidget: WidgetConfig = {
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        const updatedDashboard: Dashboard = {
          ...currentDashboard,
          id: dashboardId,
          _id: currentDashboard._id || dashboardId,
          widgets: [...currentDashboard.widgets, newWidget],
          updatedAt: new Date().toISOString(),
        };

        set({ currentDashboard: updatedDashboard });
        
        try {
          console.log('💾 Adding widget and saving to backend...', { dashboardId });
          const result = await updateDashboard(updatedDashboard);
          
          if (result.success) {
            console.log('✅ Widget added and saved to backend successfully');
            if (result.data) {
              set({ currentDashboard: result.data });
            }
          } else {
            console.error('❌ Failed to save widget to backend:', result.message);
            Swal.fire({
              icon: 'error',
              title: 'Save Failed',
              text: 'Could not save widget to backend. Please try again.',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error('❌ Error saving widget to backend:', error);
          Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Failed to connect to backend. Changes saved locally.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },

      updateWidget: async (id: string, updates: Partial<WidgetConfig>) => {
        const { currentDashboard, user, getDashboardId } = get();
        if (!currentDashboard || !user) {
          console.warn('⚠️ Cannot update widget: No dashboard selected or user not logged in');
          return;
        }

        const dashboardId = getDashboardId(currentDashboard);
        if (!dashboardId) {
          console.error('❌ Cannot update widget: Dashboard ID is missing');
          return;
        }

        const updatedDashboard: Dashboard = {
          ...currentDashboard,
          id: dashboardId,
          _id: currentDashboard._id || dashboardId,
          widgets: currentDashboard.widgets.map(w =>
            w.id === id ? { ...w, ...updates } : w
          ),
          updatedAt: new Date().toISOString(),
        };

        set({ currentDashboard: updatedDashboard });
        
        try {
          console.log(`💾 Updating widget ${id} and saving to backend...`, { dashboardId });
          const result = await updateDashboard(updatedDashboard);
          
          if (result.success) {
            console.log(`✅ Widget ${id} updated and saved to backend successfully`);
            if (result.data) {
              set({ currentDashboard: result.data });
            }
          } else {
            console.error('❌ Failed to update widget in backend:', result.message);
          }
        } catch (error) {
          console.error('❌ Error updating widget in backend:', error);
        }
      },

      removeWidget: async (id: string) => {
        const { currentDashboard, user, getDashboardId } = get();
        if (!currentDashboard || !user) {
          console.warn('⚠️ Cannot remove widget: No dashboard selected or user not logged in');
          return;
        }

        const dashboardId = getDashboardId(currentDashboard);
        if (!dashboardId) {
          console.error('❌ Cannot remove widget: Dashboard ID is missing');
          Swal.fire({
            icon: 'error',
            title: 'Cannot Remove',
            text: 'Dashboard ID is missing. Please refresh the page.',
          });
          return;
        }

        const result = await Swal.fire({
          title: 'Remove Widget?',
          html: '<span class="text-gray-600 text-sm">This widget will be removed from the dashboard</span>',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Remove',
          cancelButtonText: 'Cancel',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700',
            cancelButton: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 ml-2'
          }
        });

        if (result.isConfirmed) {
          const updatedDashboard: Dashboard = {
            ...currentDashboard,
            id: dashboardId,
            _id: currentDashboard._id || dashboardId,
            widgets: currentDashboard.widgets.filter(w => w.id !== id),
            updatedAt: new Date().toISOString(),
          };

          set({ currentDashboard: updatedDashboard });
          
          try {
            console.log(`🗑️ Removing widget ${id} and saving to backend...`, { dashboardId });
            const apiResult = await updateDashboard(updatedDashboard);
            
            if (apiResult.success) {
              console.log(`✅ Widget ${id} removed from backend successfully`);
              if (apiResult.data) {
                set({ currentDashboard: apiResult.data });
              }
              
              Swal.fire({
                icon: 'success',
                title: 'Widget Removed!',
                timer: 1000,
                showConfirmButton: false
              });
            } else {
              console.error('❌ Failed to remove widget from backend:', apiResult.message);
              Swal.fire({
                icon: 'error',
                title: 'Failed to Remove',
                text: 'Widget could not be removed from backend',
              });
            }
          } catch (error) {
            console.error('❌ Error removing widget from backend:', error);
            Swal.fire({
              icon: 'error',
              title: 'Network Error',
              text: 'Failed to connect to backend. Changes saved locally.',
              timer: 2000,
              showConfirmButton: false
            });
          }
        }
      },

      setLayout: async (widgets: WidgetConfig[]) => {
        const { currentDashboard, user, getDashboardId } = get();
        if (!currentDashboard || !user) {
          console.warn('⚠️ Cannot set layout: No dashboard selected or user not logged in');
          return;
        }

        const dashboardId = getDashboardId(currentDashboard);
        if (!dashboardId) {
          console.error('❌ Cannot save layout: Dashboard ID is missing');
          Swal.fire({
            icon: 'error',
            title: 'Cannot Save',
            text: 'Dashboard ID is missing. Please refresh the page.',
          });
          return;
        }

        const updatedDashboard: Dashboard = {
          ...currentDashboard,
          id: dashboardId,
          _id: currentDashboard._id || dashboardId,
          widgets,
          updatedAt: new Date().toISOString(),
        };

        set({ currentDashboard: updatedDashboard });
        
        try {
          console.log('💾 Saving layout to backend...', { dashboardId, widgetCount: widgets.length });
          const result = await updateDashboard(updatedDashboard);
          
          if (result.success) {
            console.log('✅ Layout saved to backend successfully');
            if (result.data) {
              set({ currentDashboard: result.data });
            }
          } else {
            console.error('❌ Failed to save layout to backend:', result.message);
          }
        } catch (error) {
          console.error('❌ Error saving layout to backend:', error);
        }
      },

      // Layout actions
      toggleEditMode: () => {
        const { currentDashboard, isEditing } = get();
        if (!currentDashboard) {
          Swal.fire({
            icon: 'warning',
            title: 'No Dashboard Selected',
            text: 'Please select or create a dashboard first',
          });
          return;
        }

        if (isEditing) {
          get().lockLayout();
        } else {
          get().unlockLayout();
        }
      },

      lockLayout: async () => {
        const { currentDashboard, getDashboardId } = get();
        if (!currentDashboard) return;

        const dashboardId = getDashboardId(currentDashboard);
        if (!dashboardId) {
          console.error('❌ Cannot lock layout: Dashboard ID is missing');
          Swal.fire({
            icon: 'error',
            title: 'Cannot Lock',
            text: 'Dashboard ID is missing',
          });
          return;
        }

        try {
          const updatedDashboard: Dashboard = {
            ...currentDashboard,
            id: dashboardId,
            _id: currentDashboard._id || dashboardId,
            isLocked: true,
            updatedAt: new Date().toISOString(),
          };

          const result = await updateDashboard(updatedDashboard);
          
          if (result.success) {
            set({ 
              currentDashboard: updatedDashboard,
              isEditing: false 
            });
            
            Swal.fire({
              icon: 'success',
              title: 'Layout Locked!',
              text: 'Dashboard layout is now locked',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error('❌ Lock layout error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Failed to Lock',
            text: 'Could not lock the layout',
          });
        }
      },

      unlockLayout: () => {
        const { currentDashboard, getDashboardId } = get();
        if (!currentDashboard) return;

        const dashboardId = getDashboardId(currentDashboard);
        if (!dashboardId) {
          console.error('❌ Cannot unlock layout: Dashboard ID is missing');
          return;
        }

        Swal.fire({
          title: 'Unlock Layout?',
          text: "You will be able to edit the dashboard layout",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Unlock',
          buttonsStyling: false,
          customClass: {
            confirmButton: 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none',
            cancelButton: 'px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 ml-2 focus:outline-none',
          },
        }).then((result) => {
          if (result.isConfirmed) {
            const updatedDashboard: Dashboard = {
              ...currentDashboard,
              id: dashboardId,
              _id: currentDashboard._id || dashboardId,
              isLocked: false,
              updatedAt: new Date().toISOString(),
            };

            set({ 
              currentDashboard: updatedDashboard,
              isEditing: true 
            });
            
            get().autoSave();
          }
        });
      },

      autoSave: () => {
        const { currentDashboard, user, getDashboardId } = get();
        
        const dashboardId = getDashboardId(currentDashboard);
        if (!currentDashboard || !user || !dashboardId) {
          console.warn('⚠️ Cannot auto-save: Missing dashboard ID or user');
          return;
        }

        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
        }

        autoSaveTimeout = setTimeout(async () => {
          try {
            console.log('💾 Auto-saving dashboard to backend...', { dashboardId });
            const result = await updateDashboard({
              ...currentDashboard,
              id: dashboardId,
              _id: currentDashboard._id || dashboardId,
            });
            
            if (result.success) {
              console.log('✅ Auto-saved dashboard to backend:', currentDashboard.name);
            } else {
              console.error('❌ Auto-save failed:', result.message);
            }
          } catch (error) {
            console.error('❌ Auto-save failed:', error);
          }
        }, 3000);
      },
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        user: state.user,
        dashboards: state.dashboards,
        currentDashboard: state.currentDashboard,
        dashboardsLoaded: state.dashboardsLoaded,
        lastLoadTime: state.lastLoadTime,
      }),
    }
  )
);