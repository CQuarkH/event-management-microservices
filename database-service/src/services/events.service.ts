// src/services/events.service.ts
import type {
  IEventsRepository,
  EventCreateInput,
  EventUpdateInput,
} from "../repositories/interfaces/i-events.repository.js";
import type { CreateEventDTO } from "../dto/events/create-event.dto.js";
import type { UpdateEventDTO } from "../dto/events/update-event.dto.js";

export class EventsService {
  constructor(private repo: IEventsRepository) {}

  async createEvent(dto: CreateEventDTO) {
    // simple validation: date parse
    const date = new Date(dto.date);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    const data: EventCreateInput = {
      name: dto.name,
      date,
      location: dto.location,
      type: dto.type,
      description: dto.description ?? null,
    };

    return this.repo.create(data);
  }

  async getEventById(id: string) {
    const event = await this.repo.findById(id);
    if (!event) throw new Error("Event not found");
    return event;
  }

  async listEvents(
    filter: Record<string, any> = {},
    pagination = { page: 1, pageSize: 100 }
  ) {
    return this.repo.findAll(filter, pagination);
  }

  async updateEvent(id: string, dto: UpdateEventDTO) {
    const data: EventUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.date) {
      const date = new Date(dto.date);
      if (isNaN(date.getTime())) throw new Error("Invalid date");
      data.date = date;
    }
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.description !== undefined) data.description = dto.description;

    return this.repo.update(id, data);
  }

  async deleteEvent(id: string) {
    return this.repo.delete(id);
  }
}
