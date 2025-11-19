import { Request, Response } from 'express';
import { AttendeesService } from '../services/attendees.service';

const service = new AttendeesService();

export const register = async (req: Request, res: Response) => {
  try {
    const result = await service.registerAttendee(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};