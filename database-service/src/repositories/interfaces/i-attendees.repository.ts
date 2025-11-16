// src/repositories/interfaces/i-attendees.repository.ts
export type AttendeeEntity = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: "confirmed" | "unconfirmed";
  eventId?: string | null;
  createdAt?: Date;
};

export type AttendeeCreateInput = {
  name: string;
  email: string;
  phone?: string | null;
  status?: "confirmed" | "unconfirmed";
  eventId?: string | null;
};

export type AttendeeUpdateStatusInput = {
  status: "confirmed" | "unconfirmed";
};

export interface IAttendeesRepository {
  create(data: AttendeeCreateInput): Promise<AttendeeEntity>;
  findById(id: string): Promise<AttendeeEntity | null>;
  findAll(
    filter?: Record<string, any>,
    pagination?: { page: number; pageSize: number }
  ): Promise<AttendeeEntity[]>;
  updateStatus(
    id: string,
    data: AttendeeUpdateStatusInput
  ): Promise<AttendeeEntity>;
  delete(id: string): Promise<void>;
}
