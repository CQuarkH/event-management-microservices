import type { ITicketsRepository } from "../repositories/interfaces/i-tickets.repository.js";
import type { CreateTicketDTO } from "../dto/tickets/create-ticket.dto.js";
import type { UpdateTicketDTO } from "../dto/tickets/update-ticket.dto.js";
import type { PurchaseTicketDTO } from "../dto/tickets/purchase-ticket.dto.js";

export class TicketsService {
  constructor(private repo: ITicketsRepository) {}

  async createTicket(dto: CreateTicketDTO) {
    if (!["general", "VIP"].includes(dto.type)) {
      throw new Error("Invalid ticket type");
    }
    if (dto.price < 0) throw new Error("Invalid price");
    if (!Number.isInteger(dto.quantityAvailable) || dto.quantityAvailable < 0)
      throw new Error("Invalid quantity");
    return this.repo.create({
      eventId: dto.eventId ?? null,
      type: dto.type,
      price: dto.price,
      quantityAvailable: dto.quantityAvailable,
    });
  }

  async getTicketById(id: string) {
    const t = await this.repo.findById(id);
    if (!t) throw new Error("Ticket not found");
    return t;
  }

  async listTickets(
    filter: Record<string, any> = {},
    pagination = { page: 1, pageSize: 100 }
  ) {
    return this.repo.findAll(filter, pagination);
  }

  async updateTicket(id: string, dto: UpdateTicketDTO) {
    // minimal validation
    if (dto.price !== undefined && dto.price < 0)
      throw new Error("Invalid price");
    if (
      dto.quantityAvailable !== undefined &&
      (!Number.isInteger(dto.quantityAvailable) || dto.quantityAvailable < 0)
    )
      throw new Error("Invalid quantity");
    return this.repo.update(id, dto as any);
  }

  async checkAvailability(eventId?: string, type?: string) {
    if (!eventId || !type) {
      throw new Error("eventId and type are required");
    }
    const t = await this.repo.findByEventAndType(eventId, type);
    if (!t) return { available: false, quantityAvailable: 0 };
    return {
      available: t.quantityAvailable > 0,
      quantityAvailable: t.quantityAvailable,
    };
  }

  /**
   * Purchase: tries to atomically decrement available and increment sold.
   * If ticketId provided uses it; else find by eventId+ticketType.
   */
  async purchaseTicket(dto: PurchaseTicketDTO) {
    if (!dto.quantity || dto.quantity <= 0 || !Number.isInteger(dto.quantity))
      throw new Error("Invalid quantity");
    let ticketId = dto.ticketId;
    if (!ticketId) {
      if (!dto.eventId || !dto.ticketType)
        throw new Error("ticketId or (eventId+ticketType) required");
      const t = await this.repo.findByEventAndType(dto.eventId, dto.ticketType);
      if (!t) throw new Error("Ticket not found");
      ticketId = t.id;
    }

    // attempt atomic purchase via repository
    const ok = await this.repo.purchaseAtomic(ticketId, dto.quantity);
    if (!ok) throw new Error("Not enough tickets available");
    // optionally log purchase / associate with attendee — out of scope here
    return { ticketId, quantity: dto.quantity, status: "purchased" };
  }

  async deleteTicket(id: string) {
    return this.repo.delete(id);
  }
}
