// src/dto/attendees/create-attendee.dto.ts
export type CreateAttendeeDTO = {
  name: string;
  email: string;
  phone?: string | null;
  status?: "confirmed" | "unconfirmed";
  eventId?: string | null;
};
