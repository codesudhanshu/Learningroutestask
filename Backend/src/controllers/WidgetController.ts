import { Request, Response } from 'express';
import { Widget } from '../models/Widget.model';
import { Dashboard } from '../models/Dashboard.model';
import { ApiResponse, CreateWidgetRequest, UpdateWidgetRequest } from '../types';
import { AuthRequest } from '../types';

export class WidgetController {
  // Create new widget
  static async createWidget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const widgetData: CreateWidgetRequest = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      // Verify dashboard exists and belongs to user
      const dashboard = await Dashboard.findOne({
        _id: widgetData.dashboardId,
        userId
      });

      if (!dashboard) {
        const response: ApiResponse = {
          success: false,
          message: 'Dashboard not found or access denied'
        };
        res.status(404).json(response);
        return;
      }

      // Create widget
      const widget = await Widget.create({
        ...widgetData,
        userId,
        dashboardId: widgetData.dashboardId
      });

      // Add widget to dashboard
      await Dashboard.findByIdAndUpdate(
        widgetData.dashboardId,
        { $push: { widgets: widget._id } }
      );

      const response: ApiResponse = {
        success: true,
        message: 'Widget created successfully',
        data: widget
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create widget',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Get widgets for dashboard
  static async getDashboardWidgets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { dashboardId } = req.params;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const widgets = await Widget.find({
        dashboardId,
        userId
      }).sort({ createdAt: -1 });

      const response: ApiResponse = {
        success: true,
        message: 'Widgets retrieved successfully',
        data: widgets
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve widgets',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Update widget
  static async updateWidget(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { id } = req.params;
      const updates: UpdateWidgetRequest = req.body;

      if (!userId) {
        const response: ApiResponse = {
          success: false,
          message: 'User not authenticated'
        };
        res.status(401).json(response);
        return;
      }

      const widget = await Widget.findOneAndUpdate(
        { _id: id, userId },
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!widget) {
        const response: ApiResponse = {
          success: false,
          message: 'Widget not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Widget updated successfully',
        data: widget
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update widget',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Delete widget
  static async deleteWidget(req: AuthRequest, res: Response): Promise<void> {
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

      const widget = await Widget.findOne({ _id: id, userId });
      if (!widget) {
        const response: ApiResponse = {
          success: false,
          message: 'Widget not found'
        };
        res.status(404).json(response);
        return;
      }

      // Remove widget from dashboard
      await Dashboard.findByIdAndUpdate(
        widget.dashboardId,
        { $pull: { widgets: widget._id } }
      );

      // Delete widget
      await widget.deleteOne();

      const response: ApiResponse = {
        success: true,
        message: 'Widget deleted successfully'
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete widget',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
}