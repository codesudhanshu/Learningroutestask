// backend/middleware/auth.middleware.ts
import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User.model';
import { AuthRequest, ApiResponse } from '../types';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required. Please login.'
      };
      res.status(401).json(response);
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired token. Please login again.'
      };
      res.status(401).json(response);
      return;
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found. Please login again.'
      };
      res.status(401).json(response);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

// Optional: Authorization middleware for specific permissions
export const authorizeDashboard = (
  permissions: string[] = ['owner']
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const { id } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // If just checking for authenticated user, pass through
      if (permissions.includes('authenticated')) {
        return next();
      }

      // For dashboard-specific operations, check ownership
      if (id) {
        const Dashboard = require('../models/Dashboard.model').default;
        const dashboard = await Dashboard.findById(id);
        
        if (!dashboard) {
          const response: ApiResponse = {
            success: false,
            message: 'Dashboard not found'
          };
          res.status(404).json(response);
          return;
        }

        // Check if user is owner
        if (permissions.includes('owner') && !dashboard.userId.equals(userId)) {
          const response: ApiResponse = {
            success: false,
            message: 'You do not have permission to perform this action'
          };
          res.status(403).json(response);
          return;
        }

        // Check if dashboard is public and user wants to view
        if (permissions.includes('view') && dashboard.isPublic) {
          return next();
        }
      }

      next();
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        message: 'Authorization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  };
};