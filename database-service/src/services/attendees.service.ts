// src/services/attendees.service.ts
import type {
  IAttendeesRepository,
  AttendeeCreateInput,
  AttendeeEntity,
  AttendeeUpdateStatusInput,
} from "../repositories/interfaces/i-attendees.repository.js";
import type { CreateAttendeeDTO } from "../dto/attendees/create-attendee.dto.js";
import type { UpdateAttendeeStatusDTO } from "../dto/attendees/update-attendee.dto.js";

export class AttendeesService {
  constructor(private repo: IAttendeesRepository) {}

  private isValidEmail(email: string) {
    // simple email regex, good enough for validation branches in tests
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async createAttendee(dto: CreateAttendeeDTO): Promise<AttendeeEntity> {
    if (!dto.name || typeof dto.name !== "string")
      throw new Error("Invalid name");
    if (!dto.email || !this.isValidEmail(dto.email))
      throw new Error("Invalid email");
    const payload: AttendeeCreateInput = {
      name: dto.name,
      email: dto.email,
      phone: dto.phone ?? null,
      status: dto.status ?? "unconfirmed",
      eventId: dto.eventId ?? null,
    };
    return this.repo.create(payload);
  }

  async getAttendeeById(id: string): Promise<AttendeeEntity> {
    const a = await this.repo.findById(id);
    if (!a) throw new Error("Attendee not found");
    return a;
  }

  async listAttendees(
    filter: Record<string, any> = {},
    pagination = { page: 1, pageSize: 100 }
  ) {
    return this.repo.findAll(filter, pagination);
  }

  async updateStatus(
    id: string,
    dto: UpdateAttendeeStatusDTO
  ): Promise<AttendeeEntity> {
    if (dto.status !== "confirmed" && dto.status !== "unconfirmed")
      throw new Error("Invalid status");
    return this.repo.updateStatus(id, { status: dto.status });
  }

  async deleteAttendee(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
