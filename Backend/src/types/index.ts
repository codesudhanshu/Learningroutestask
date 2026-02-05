import { Request } from 'express';
import { IUser } from '../models/User.model';

// Extend Express Request type
export interface AuthRequest extends Request {
  user?: IUser;
}

// Generic type for API response
export interface ApiResponse<T = any, M = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: M; // Add meta field for additional information
}

// Or simpler version without generic meta:
export interface SimpleApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: Record<string, any>; // Flexible meta object
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

// Dashboard types
export interface CreateDashboardRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
}

// types/index.ts में WidgetData interface add करें
export interface WidgetData {
  id: string;
  type: string;
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

// UpdateDashboardRequest को update करें
export interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  widgets?: WidgetData[]; // ✅ Change string[] to WidgetData[]
  layout?: any;
  isLocked?: boolean;
  isPublic?: boolean;
}

// Widget types
export interface CreateWidgetRequest {
  type: 'bar' | 'line' | 'treemap' | 'scatter';
  title: string;
  dataSource: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
  dashboardId: string;
}



export interface UpdateWidgetRequest {
  title?: string;
  dataSource?: string;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config?: Record<string, any>;
}

// Mock Data types
export interface CategoricalData {
  name: string;
  value: number;
}

export interface TimeSeriesData {
  timestamp: string;
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