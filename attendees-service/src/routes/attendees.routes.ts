import { Router } from 'express';
import * as AttendeeController from '../controllers/attendees.controller';

const router = Router();

router.post('/', AttendeeController.register);
router.get('/:id', AttendeeController.getOne);

export default router;