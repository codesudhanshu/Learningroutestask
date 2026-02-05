import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { generateToken } from '../utils/jwt';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password }: RegisterRequest = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'User already exists with this email'
        };
        res.status(400).json(response);
        return;
      }

      // Create new user
      const user = await User.create({ name, email, password });
      
      // Generate token
      const token = generateToken(user);
      
      const authResponse: AuthResponse = {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        },
        token
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Registration successful',
        data: authResponse
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Registration failed',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Login user
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password'
        };
        res.status(401).json(response);
        return;
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email or password'
        };
        res.status(401).json(response);
        return;
      }

      // Generate token
      const token = generateToken(user);
      
      const authResponse: AuthResponse = {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email
        },
        token
      };

      const response: ApiResponse<AuthResponse> = {
        success: true,
        message: 'Login successful',
        data: authResponse
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Login failed',
        error: error.message
      };
      res.status(500).json(response);
    }
  }

  // Get current user
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // This would be called from authenticated route
      const user = (req as any).user;
      
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'User not found'
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      };
      
      res.status(200).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        message: 'Failed to get user',
        error: error.message
      };
      res.status(500).json(response);
    }
  }
}