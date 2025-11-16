// src/repositories/interfaces/i-events.repository.ts
export type EventCreateInput = {
  name: string;
  date: Date;
  location: string;
  type: string;
  description?: string | null;
};

export type EventUpdateInput = Partial<{
  name: string;
  date: Date;
  location: string;
  type: string;
  description: string | null;
}>;

export interface IEventsRepository {
  create(data: EventCreateInput): Promise<any>;
  findById(id: string): Promise<any | null>;
  findAll(
    filter?: Record<string, any>,
    pagination?: { page: number; pageSize: number }
  ): Promise<any[]>;
  update(id: string, data: EventUpdateInput): Promise<any>;
  delete(id: string): Promise<void>;
}
