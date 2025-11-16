export type TicketEntity = {
  id: string;
  type: string;
  price: number;
  quantityAvailable: number;
  quantitySold: number;
  eventId?: string | null;
};

export type Pagination = { page: number; pageSize: number };

export interface ITicketsRepository {
  create(data: {
    eventId?: string | null;
    type: string;
    price: number;
    quantityAvailable: number;
  }): Promise<TicketEntity>;

  findById(id: string): Promise<TicketEntity | null>;

  findAll(
    filter?: Record<string, any>,
    pagination?: Pagination
  ): Promise<TicketEntity[]>;

  update(id: string, data: Partial<TicketEntity>): Promise<TicketEntity>;

  delete(id: string): Promise<void>;

  findByEventAndType(
    eventId: string,
    type: string
  ): Promise<TicketEntity | null>;

  // atomic purchase: decrement available and increment sold if enough available; returns true if succeeded
  purchaseAtomic(ticketId: string, qty: number): Promise<boolean>;
}
