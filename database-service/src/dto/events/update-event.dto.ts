// src/dto/events/update-event.dto.ts
export interface UpdateEventDTO {
  name?: string;
  date?: string;
  location?: string;
  type?: string;
  description?: string | null;
}
