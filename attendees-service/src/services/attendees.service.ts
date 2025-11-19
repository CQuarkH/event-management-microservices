import axios from 'axios';
import { config } from '../config/env';

export class AttendeesService {
  async registerAttendee(data: { name: string; email: string; phone?: string }) {
    try {
      // 1. Crear en Database Service
      const dbResponse = await axios.post(`${config.dbServiceUrl}/attendees`, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: 'unconfirmed'
      });
      
      // 2. Notificar
      await axios.post(`${config.notifServiceUrl}/api/notifications/send`, {
        type: 'EMAIL',
        message: `Hola ${data.name}, gracias por registrarte.`,
        recipients: [data.email]
      }).catch(e => console.error("Notif error:", e.message));

      return dbResponse.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al registrar');
    }
  }

  async getAttendee(id: string) {
    try {
      const res = await axios.get(`${config.dbServiceUrl}/attendees/${id}`);
      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error obteniendo asistente');
    }
  }
  
  async confirmAttendance(id: string) {
    try {
      const dbResponse = await axios.patch(`${config.dbServiceUrl}/attendees/${id}/status`, {
        status: 'confirmed'
      });
      const updated = dbResponse.data;

      if (updated.email) {
        await axios.post(`${config.notifServiceUrl}/api/notifications/send`, {
          type: 'EMAIL',
          message: `Confirmado: ${updated.name}`,
          recipients: [updated.email]
        }).catch(e => console.error(e));
      }
      return updated;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error confirmando');
    }
  }
}