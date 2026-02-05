import { Router } from 'express';
import { DataController } from '../controllers/DataController';

const router = Router();

// Public data routes
router.get('/health', DataController.healthCheck);
router.get('/info', DataController.getApiInfo);
router.get('/:type', DataController.getMockData);

export default router;