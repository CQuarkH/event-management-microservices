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
      
      const newAttendee = dbResponse.data;

      // 2. Enviar Notificación de Bienvenida
      await axios.post(`${config.notifServiceUrl}/api/notifications/send`, {
        type: 'EMAIL',
        message: `Hola ${data.name}, gracias por registrarte. Por favor confirma tu asistencia.`,
        recipients: [data.email]
      }).catch(err => console.error("Error enviando notificación:", err.message));

      return newAttendee;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al registrar asistente');
    }
  }

  async confirmAttendance(id: string) {
    try {
      // 1. Actualizar estado en Database Service
      const dbResponse = await axios.patch(`${config.dbServiceUrl}/attendees/${id}/status`, {
        status: 'confirmed'
      });
      
      const updatedAttendee = dbResponse.data;

      // 2. Enviar Notificación de Confirmación
      if (updatedAttendee.email) {
        await axios.post(`${config.notifServiceUrl}/api/notifications/send`, {
          type: 'EMAIL',
          message: `¡Tu asistencia ha sido confirmada, ${updatedAttendee.name}!`,
          recipients: [updatedAttendee.email]
        }).catch(err => console.error("Error enviando notificación:", err.message));
      }

      return updatedAttendee;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error confirmando asistencia');
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

  // Actualizar datos de un asistente
  async updateAttendee(id: string, data: { name?: string; email?: string; phone?: string }) {
    try {
      const dbResponse = await axios.patch(`${config.dbServiceUrl}/attendees/${id}`, data);
      return dbResponse.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error actualizando asistente');
    }
  }

  // Cancelar asistencia
  async cancelAttendance(id: string) {
    try {
      const dbResponse = await axios.patch(`${config.dbServiceUrl}/attendees/${id}/status`, {
        status: 'unconfirmed'
      });

      const updatedAttendee = dbResponse.data;

      // Notificar cancelación
      if (updatedAttendee.email) {
        await axios.post(`${config.notifServiceUrl}/api/notifications/send`, {
          type: 'EMAIL',
          message: `Tu registro ha sido cancelado, ${updatedAttendee.name}.`,
          recipients: [updatedAttendee.email]
        }).catch(err => console.error('Error enviando notificación de cancelación:', err.message));
      }

      return updatedAttendee;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error cancelando asistencia');
    }
  }
}