export interface CreateTicketDTO {
  eventId?: string | null;
  type: string; // "general" | "VIP"
  price: number;
  quantityAvailable: number;
}
