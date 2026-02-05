// backend/routes/dashboard.routes.ts
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard CRUD operations
router.post('/', DashboardController.createDashboard);
router.get('/', DashboardController.getUserDashboards); // Get current user's dashboards
router.get('/user/:userId', DashboardController.getDashboardsByUserId); // Get specific user's dashboards
router.get('/:id', DashboardController.getDashboardById);
router.put('/:id', DashboardController.updateDashboard);
router.delete('/:id', DashboardController.deleteDashboard);
router.put('/:id/layout', DashboardController.saveLayout);

export default router;