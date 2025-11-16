// src/dto/events/create-event.dto.ts
export interface CreateEventDTO {
  name: string;
  date: string; // ISO string
  location: string;
  type: string;
  description?: string;
}
