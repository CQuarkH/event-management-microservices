export interface PurchaseTicketDTO {
  eventId?: string;
  ticketType?: string;
  ticketId?: string;
  quantity: number;
  attendeeId?: string | null;
}
