import { Router } from 'express';
import { WidgetController } from '../controllers/WidgetController';
// import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All widget routes require authentication
// router.use(authenticate);

// Widget CRUD operations
router.post('/', WidgetController.createWidget);
router.get('/dashboard/:dashboardId', WidgetController.getDashboardWidgets);
router.put('/:id', WidgetController.updateWidget);
router.delete('/:id', WidgetController.deleteWidget);

export default router;