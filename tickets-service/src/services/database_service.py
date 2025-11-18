import requests
from typing import List, Optional
from src.models.ticket import Ticket
from src.config import Config


class DatabaseService:
    def __init__(self):
        self.base_url = Config.DATABASE_SERVICE_URL

    def get_all_tickets(self) -> List[Ticket]:
        """Obtener todas las entradas disponibles"""
        try:
            response = requests.get(f"{self.base_url}/tickets")
            response.raise_for_status()
            tickets_data = response.json()
            return [Ticket.from_dict(ticket) for ticket in tickets_data]
        except requests.RequestException as e:
            raise Exception(f"Error al obtener entradas: {str(e)}")

    def get_ticket_by_id(self, ticket_id: str) -> Optional[Ticket]:
        """Obtener una entrada específica por ID"""
        try:
            response = requests.get(f"{self.base_url}/tickets/{ticket_id}")
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return Ticket.from_dict(response.json())
        except requests.RequestException as e:
            raise Exception(f"Error al obtener entrada {ticket_id}: {str(e)}")

    def update_ticket(self, ticket_id: str, ticket_data: dict) -> Ticket:
        """Actualizar una entrada específica"""
        try:
            response = requests.put(
                f"{self.base_url}/tickets/{ticket_id}",
                json=ticket_data
            )
            response.raise_for_status()
            return Ticket.from_dict(response.json())
        except requests.RequestException as e:
            raise Exception(f"Error al actualizar entrada {
                            ticket_id}: {str(e)}")

    def create_ticket(self, ticket_data: dict) -> Ticket:
        """Crear una nueva entrada"""
        try:
            response = requests.post(
                f"{self.base_url}/tickets",
                json=ticket_data
            )
            response.raise_for_status()
            return Ticket.from_dict(response.json())
        except requests.RequestException as e:
            raise Exception(f"Error al crear entrada: {str(e)}")

    def delete_ticket(self, ticket_id: str) -> bool:
        """Eliminar una entrada"""
        try:
            response = requests.delete(
                f"{self.base_url}/tickets/{ticket_id}")
            return response.status_code == 200
        except requests.RequestException as e:
            raise Exception(f"Error al eliminar entrada {ticket_id}: {str(e)}")
