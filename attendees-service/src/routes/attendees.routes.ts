import { Router } from 'express';
import * as AttendeeController from '../controllers/attendees.controller';

const router = Router();

/** POST /api/attendees - Crear asistente */
router.post('/', AttendeeController.register);

/** GET /api/attendees/:id - Obtener asistente */
router.get('/:id', AttendeeController.getOne);

/** PATCH /api/attendees/:id/confirm - Confirmar asistencia */
router.patch('/:id/confirm', AttendeeController.confirm);

/** PUT /api/attendees/:id - Actualizar datos */
router.put('/:id', AttendeeController.update);

/** DELETE /api/attendees/:id - Cancelar asistencia */
router.delete('/:id', AttendeeController.cancel);

export default router;