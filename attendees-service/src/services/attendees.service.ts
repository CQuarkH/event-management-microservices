import axios from 'axios';
import { config } from '../config/env';

export class AttendeesService {
  async registerAttendee(data: { name: string; email: string; phone?: string }) {
    throw new Error('Method not implemented.');
  }
}