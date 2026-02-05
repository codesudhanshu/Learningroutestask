export type WidgetType = 'bar' | 'line' | 'treemap' | 'scatter';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: Record<string, any>;
}

export interface Dashboard {
    _id: string;
    id:string;
  name: string;
  userId: string;
  widgets: WidgetConfig[];
  createdAt: string;
  updatedAt: string;
  isLocked?: boolean;
  isPublic?:boolean;
  description?:string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface DashboardState {
  user: User | null;
  currentDashboard: Dashboard | null;
  dashboards: Dashboard[];
  isEditing: boolean;
  isLoading: boolean;
}

// Add helper type for partial dashboard
export interface DashboardUpdate {
  id: string;
  name?: string;
  widgets?: WidgetConfig[];
  isLocked?: boolean;
  updatedAt?: string;
}

// Data types for different charts
export interface CategoricalData {
  name: string;
  value: number;
}

export interface TimeSeriesData {
  timestamp: string; // ISO-8601
  value: number;
}

export interface HierarchicalData {
  name: string;
  children?: HierarchicalData[];
  value?: number;
}

export interface RelationalData {
  x: number;
  y: number;
  label?: string;
}