import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import widgetRoutes from './routes/widget.routes';
import dataRoutes from './routes/data.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/widgets', widgetRoutes);
app.use('/api/data', dataRoutes);

// Welcome route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🚀 Dashboard Builder API',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      data: 'GET /api/data/:type',
      auth: 'POST /api/auth/register | /api/auth/login',
      dashboards: 'CRUD /api/dashboards',
      widgets: 'CRUD /api/widgets'
    },
    status: 'operational',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack);
  
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong!',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 Server is running!
  
  📍 Local: http://localhost:${PORT}
  📍 Environment: ${NODE_ENV}
  
  📊 API Endpoints:
  --------------------------------
  Home:       GET  http://localhost:${PORT}/
  Health:     GET  http://localhost:${PORT}/api/health
  Data:       GET  http://localhost:${PORT}/api/data/:type
  Register:   POST http://localhost:${PORT}/api/auth/register
  Login:      POST http://localhost:${PORT}/api/auth/login
  --------------------------------
  
  ⏰ ${new Date().toLocaleString()}
  `);
});

export default app;