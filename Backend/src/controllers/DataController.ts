import { Request, Response } from 'express';
import { MockDataGenerator } from '../utils/generateMockData';
import { ApiResponse } from '../types';

export class DataController {
  // Get mock data by type
  static async getMockData(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const { count, days } = req.query;

      // Validate type
      const validTypes = ['categorical', 'temporal', 'hierarchical', 'relational'];
      if (!validTypes.includes(type.toLowerCase())) {
        const response: ApiResponse = {
          success: false,
          message: `Invalid data type. Valid types are: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      // Parse query parameters
      const params: any = {};
      if (count) {
        const countNum = parseInt(count as string);
        if (!isNaN(countNum) && countNum > 0) {
          params.count = Math.min(countNum, 100); // Limit to 100 items
        }
      }
      
      if (days) {
        const daysNum = parseInt(days as string);
        if (!isNaN(daysNum) && daysNum > 0) {
          params.days = Math.min(daysNum, 365); // Limit to 365 days
        }
      }

      // Generate data
      const data = MockDataGenerator.getDataByType(type, params);

      const response: ApiResponse = {
        success: true,
        message: 'Data generated successfully',
        data,
        meta: {
          type,
          count: Array.isArray(data) ? data.length : 'n/a',
          generatedAt: new Date().toISOString()
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to generate data',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Health check endpoint
  static async healthCheck(req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      message: 'Dashboard Builder API is running',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    };
    
    res.status(200).json(response);
  }

  // Get API info
  static async getApiInfo(req: Request, res: Response): Promise<void> {
    const response: ApiResponse = {
      success: true,
      message: 'Dashboard Builder API Information',
      data: {
        name: process.env.APP_NAME || 'Dashboard Builder API',
        version: process.env.APP_VERSION || '1.0.0',
        endpoints: {
          auth: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login'
          },
          dashboards: {
            create: 'POST /api/dashboards',
            list: 'GET /api/dashboards',
            get: 'GET /api/dashboards/:id',
            update: 'PUT /api/dashboards/:id',
            delete: 'DELETE /api/dashboards/:id'
          },
          data: {
            mock: 'GET /api/data/:type',
            health: 'GET /api/health'
          }
        }
      }
    };
    
    res.status(200).json(response);
  }
}