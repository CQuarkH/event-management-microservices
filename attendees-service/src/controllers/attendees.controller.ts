import { Request, Response } from 'express';
import { AttendeesService } from '../services/attendees.service';

const service = new AttendeesService();

export const register = async (req: Request, res: Response) => {
  try {
    const result = await service.registerAttendee(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  };
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const result = await service.getAttendee(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: 'Asistente no encontrado' });
  }
};

export const confirm = async (req: Request, res: Response) => {
  try {
    const result = await service.confirmAttendance(req.params.id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};