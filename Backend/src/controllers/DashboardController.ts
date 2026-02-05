// controllers/DashboardController.ts
import { Response } from 'express';
import { Dashboard } from '../models/Dashboard.model';
import { 
  ApiResponse, 
  CreateDashboardRequest, 
  UpdateDashboardRequest,
  CategoricalData,
  TimeSeriesData,
  HierarchicalData,
  RelationalData 
} from '../types';
import { AuthRequest } from '../types';
import { Types } from 'mongoose';

// ✅ Widget interface define करें
interface WidgetData {
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

export class DashboardController {
  // Create new dashboard
  static async createDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { name, description, isPublic }: CreateDashboardRequest = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      if (!name || name.trim() === '') {
        const response: ApiResponse = {
          success: false,
          message: 'Dashboard name is required'
        };
        res.status(400).json(response);
        return;
      }

      // Create new dashboard
      const dashboard = await Dashboard.create({
        name: name.trim(),
        description: description?.trim() || '',
        userId,
        widgets: [],
        layout: {},
        isLocked: false,
        isPublic: isPublic || false
      });

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard created successfully',
        data: dashboard
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      console.error('Create dashboard error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create dashboard',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Get all dashboards for authenticated user
  static async getUserDashboards(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const dashboards = await Dashboard.find({ userId })
        .sort({ updatedAt: -1 });

      const response: ApiResponse = {
        success: true,
        message: 'Dashboards retrieved successfully',
        data: dashboards
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Get user dashboards error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve dashboards',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Get dashboards by specific user ID
  static async getDashboardsByUserId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const currentUserId = req.user?._id;
      const { userId } = req.params;

      if (!currentUserId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Validate userId format
      if (!Types.ObjectId.isValid(userId)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid user ID format'
        };
        res.status(400).json(response);
        return;
      }

      const requestedUserId = new Types.ObjectId(userId);
      
      // Check if current user can access requested user's dashboards
      const isSameUser = currentUserId.equals(requestedUserId);
      
      if (!isSameUser) {
        // Check if user is trying to access public dashboards
        const publicDashboards = await Dashboard.find({ 
          userId: requestedUserId,
          isPublic: true 
        });

        if (publicDashboards.length > 0) {
          const response: ApiResponse = {
            success: true,
            message: 'Public dashboards retrieved successfully',
            data: publicDashboards
          };
          res.status(200).json(response);
          return;
        }

        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized to view these dashboards'
        };
        res.status(403).json(response);
        return;
      }

      // User is accessing their own dashboards
      const dashboards = await Dashboard.find({ userId: requestedUserId })
        .sort({ updatedAt: -1 });

      const response: ApiResponse = {
        success: true,
        message: 'Dashboards retrieved successfully',
        data: dashboards
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Get dashboards by user ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve dashboards',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Get single dashboard by ID
  static async getDashboardById(req: AuthRequest, res: Response): Promise<void> {
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

      // Validate dashboard ID
      if (!Types.ObjectId.isValid(id)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid dashboard ID'
        };
        res.status(400).json(response);
        return;
      }

      const dashboardId = new Types.ObjectId(id);
      const dashboard = await Dashboard.findOne({ _id: dashboardId });

      if (!dashboard) {
        const response: ApiResponse = {
          success: false,
          message: 'Dashboard not found'
        };
        res.status(404).json(response);
        return;
      }

      // Check if user has access (owner or public)
      const isOwner = dashboard.userId.equals(userId);
      const isPublic = dashboard.isPublic;
      
      if (!isOwner && !isPublic) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized to view this dashboard'
        };
        res.status(403).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard retrieved successfully',
        data: dashboard
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Get dashboard by ID error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve dashboard',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // ✅ CORRECTED: Update dashboard for embedded widgets
  static async updateDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { id } = req.params;
      const updates: UpdateDashboardRequest & { widgets?: WidgetData[] } = req.body;

      console.log('📤 Update request received:', {
        dashboardId: id,
        updates: {
          ...updates,
          widgets: updates.widgets ? `Array(${updates.widgets.length})` : 'undefined'
        }
      });

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Validate dashboard ID
      if (!Types.ObjectId.isValid(id)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid dashboard ID'
        };
        res.status(400).json(response);
        return;
      }

      const dashboardId = new Types.ObjectId(id);
      
      // Find dashboard
      const dashboard = await Dashboard.findOne({ _id: dashboardId, userId });
      
      if (!dashboard) {
        const response: ApiResponse = {
          success: false,
          message: 'Dashboard not found'
        };
        res.status(404).json(response);
        return;
      }

      // ✅ Prepare update data
      const updateData: any = {
        updatedAt: new Date()
      };

      // Allowed fields
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.isLocked !== undefined) updateData.isLocked = updates.isLocked;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;
      if (updates.layout !== undefined) updateData.layout = updates.layout;
      
      // ✅ Handle widgets - IMPORTANT: Validate widget structure
      if (updates.widgets !== undefined) {
        if (Array.isArray(updates.widgets)) {
          updateData.widgets = updates.widgets.map((widget: WidgetData) => ({
            id: widget.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: widget.type || 'bar',
            title: widget.title || 'Untitled Widget',
            dataSource: widget.dataSource || 'default',
            position: widget.position || { x: 0, y: 0, w: 4, h: 3 },
            config: widget.config || {}
          }));
        } else {
          updateData.widgets = [];
        }
        
        console.log('🔄 Widgets to update:', updateData.widgets.length);
      }

      // Update dashboard with $set operator
      const updatedDashboard = await Dashboard.findOneAndUpdate(
        { _id: dashboardId, userId },
        { $set: updateData },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!updatedDashboard) {
        const response: ApiResponse = {
          success: false,
          message: 'Failed to update dashboard'
        };
        res.status(500).json(response);
        return;
      }

      console.log('✅ Dashboard updated successfully:', {
        id: updatedDashboard._id,
        name: updatedDashboard.name,
        widgetCount: updatedDashboard.widgets.length
      });

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard updated successfully',
        data: updatedDashboard
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('❌ Update dashboard error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update dashboard',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Delete dashboard
  static async deleteDashboard(req: AuthRequest, res: Response): Promise<void> {
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

      // Validate dashboard ID
      if (!Types.ObjectId.isValid(id)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid dashboard ID'
        };
        res.status(400).json(response);
        return;
      }

      const dashboardId = new Types.ObjectId(id);
      
      // Find dashboard
      const dashboard = await Dashboard.findOne({ _id: dashboardId });
      if (!dashboard) {
        const response: ApiResponse = {
          success: false,
          message: 'Dashboard not found'
        };
        res.status(404).json(response);
        return;
      }

      // Check if user owns the dashboard
      if (!dashboard.userId.equals(userId)) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized to delete this dashboard'
        };
        res.status(403).json(response);
        return;
      }

      // ✅ No need to delete widgets separately - they are embedded
      await dashboard.deleteOne();

      const response: ApiResponse = {
        success: true,
        message: 'Dashboard deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Delete dashboard error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete dashboard',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Save dashboard layout
  static async saveLayout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { id } = req.params;
      const { layout, widgets } = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Validate dashboard ID
      if (!Types.ObjectId.isValid(id)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid dashboard ID'
        };
        res.status(400).json(response);
        return;
      }

      const dashboardId = new Types.ObjectId(id);
      
      // Find dashboard and check ownership
      const dashboard = await Dashboard.findOne({ _id: dashboardId });
      
      if (!dashboard) {
        const response: ApiResponse = {
          success: false,
          message: 'Dashboard not found'
        };
        res.status(404).json(response);
        return;
      }

      // Check if user owns the dashboard
      if (!dashboard.userId.equals(userId)) {
        const response: ApiResponse = {
          success: false,
          message: 'Unauthorized to update this dashboard'
        };
        res.status(403).json(response);
        return;
      }

      const updatedDashboard = await Dashboard.findOneAndUpdate(
        { _id: dashboardId, userId },
        { 
          layout: layout || {},
          widgets: widgets || [],
          updatedAt: new Date() 
        },
        { new: true }
      );

      const response: ApiResponse = {
        success: true,
        message: 'Layout saved successfully',
        data: updatedDashboard
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      console.error('Save layout error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to save layout',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
}