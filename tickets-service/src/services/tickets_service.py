from typing import List, Optional
from src.models.ticket import Ticket, TicketPurchase
from src.services.database_service import DatabaseService


class TicketsService:
    def __init__(self):
        self.db_service = DatabaseService()

    def check_availability(self, ticket_id: str) -> Optional[int]:
        """
        Verificar disponibilidad de entradas
        Retorna la cantidad disponible o None si no existe la entrada
        """
        ticket = self.db_service.get_ticket_by_id(ticket_id)
        if not ticket:
            return None

        return ticket.quantity_available

    def check_availability_for_quantity(self, ticket_id: str, quantity: int) -> bool:
        """
        Verificar si hay suficientes entradas disponibles para una cantidad específica
        """
        available = self.check_availability(ticket_id)
        if available is None:
            return False

        return available >= quantity

    def purchase_tickets(self, ticket_id: str, quantity: int) -> dict:
        """
        Procesar compra de entradas
        Retorna información de la compra o lanza excepción si no es posible
        """
        ticket = self.db_service.get_ticket_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Entrada con ID {ticket_id} no encontrada")

        # Verificar disponibilidad (usar el ticket ya obtenido)
        if ticket.quantity_available < quantity:
            raise ValueError(f"No hay suficientes entradas disponibles. Disponibles: {
                             ticket.quantity_available}, Solicitadas: {quantity}")

        # Actualizar cantidades
        new_quantity_available = ticket.quantity_available - quantity
        new_quantity_sold = ticket.quantity_sold + quantity

        updated_ticket_data = {
            "quantityAvailable": new_quantity_available,
            "quantitySold": new_quantity_sold
        }

        updated_ticket = self.db_service.update_ticket(
            ticket_id, updated_ticket_data)

        total_amount = ticket.price * quantity

        return {
            "ticket_id": ticket_id,
            "ticket_type": ticket.type,
            "quantity_purchased": quantity,
            "unit_price": ticket.price,
            "total_amount": total_amount,
            "remaining_available": updated_ticket.quantity_available
        }

    def get_all_tickets(self) -> List[dict]:
        """
        Obtener todas las entradas con información de disponibilidad
        """
        tickets = self.db_service.get_all_tickets()
        return [
            {
                **ticket.to_dict(),
                "available": ticket.quantity_available > 0
            }
            for ticket in tickets
        ]

    def get_ticket_info(self, ticket_id: str) -> Optional[dict]:
        """
        Obtener información detallada de una entrada específica
        """
        ticket = self.db_service.get_ticket_by_id(ticket_id)
        if not ticket:
            return None

        return {
            **ticket.to_dict(),
            "available": ticket.quantity_available > 0,
            "sold_out": ticket.quantity_available == 0
        }

    def update_ticket_info(self, ticket_id: str, update_data: dict) -> dict:
        """
        Actualizar información de una entrada (precio, tipo, etc.)
        """
        ticket = self.db_service.get_ticket_by_id(ticket_id)
        if not ticket:
            raise ValueError(f"Entrada con ID {ticket_id} no encontrada")

        field_mapping = {
            'type': 'type',
            'price': 'price',
            'quantity_available': 'quantityAvailable'
        }

        filtered_data = {}
        for k, v in update_data.items():
            if k in field_mapping:
                db_field = field_mapping[k]
                filtered_data[db_field] = v

        if not filtered_data:
            raise ValueError(
                "No se proporcionaron campos válidos para actualizar")

        updated_ticket = self.db_service.update_ticket(
            ticket_id, filtered_data)

        return {
            **updated_ticket.to_dict(),
            "available": updated_ticket.quantity_available > 0
        }
