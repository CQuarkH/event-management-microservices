import unittest
from unittest.mock import Mock, patch
import json
from src.app import create_app


class TestTicketsIntegration(unittest.TestCase):

    def setUp(self):
        """Configurar la aplicación de prueba"""
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

        # Datos de prueba
        self.sample_ticket = {
            'id': "1",
            'type': 'VIP',
            'price': 150.0,
            'quantity_available': 50,
            'quantity_sold': 10
        }

    @patch('src.services.database_service.DatabaseService.get_ticket_by_id')
    def test_check_availability_endpoint_existing_ticket(self, mock_get_ticket):
        """Probar endpoint de verificación de disponibilidad para ticket existente"""
        from src.models.ticket import Ticket
        mock_get_ticket.return_value = Ticket.from_dict(self.sample_ticket)

        response = self.client.get('/api/tickets/availability/1')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)

        expected = {
            "ticket_id": "1",
            "available_quantity": 50,
            "available": True
        }
        self.assertEqual(data, expected)

    @patch('src.services.database_service.DatabaseService.get_ticket_by_id')
    def test_check_availability_endpoint_non_existing_ticket(self, mock_get_ticket):
        """Probar endpoint de verificación de disponibilidad para ticket inexistente"""
        mock_get_ticket.return_value = None

        response = self.client.get('/api/tickets/availability/999')

        self.assertEqual(response.status_code, 404)
        data = json.loads(response.data)
        self.assertIn("error", data)
        self.assertIn("Entrada no encontrada", data["error"])

    @patch('src.services.database_service.DatabaseService.update_ticket')
    @patch('src.services.database_service.DatabaseService.get_ticket_by_id')
    def test_purchase_tickets_endpoint_successful(self, mock_get_ticket, mock_update_ticket):
        """Probar endpoint de compra exitosa de tickets"""
        from src.models.ticket import Ticket
        original_ticket = Ticket.from_dict(self.sample_ticket)
        updated_ticket = Ticket.from_dict({
            **self.sample_ticket,
            'quantity_available': 45,
            'quantity_sold': 15
        })

        mock_get_ticket.return_value = original_ticket
        mock_update_ticket.return_value = updated_ticket

        request_data = {
            'ticket_id': "1",
            'quantity': 5
        }

        # Realizar solicitud
        response = self.client.post(
            '/api/tickets/purchase',
            data=json.dumps(request_data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)

        self.assertTrue(data["success"])
        self.assertEqual(data["purchase"]["quantity_purchased"], 5)
        self.assertEqual(data["purchase"]["total_amount"], 750.0)
        self.assertEqual(data["purchase"]["remaining_available"], 45)

    def test_purchase_tickets_endpoint_invalid_data(self):
        """Probar endpoint de compra con datos inválidos"""
        # Solicitud sin datos
        response = self.client.post('/api/tickets/purchase')
        self.assertEqual(response.status_code, 400)

        # Solicitud sin ticket_id
        request_data = {'quantity': 5}
        response = self.client.post(
            '/api/tickets/purchase',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

        # Solicitud con cantidad inválida
        request_data = {
            'ticket_id': "1",
            'quantity': 0
        }
        response = self.client.post(
            '/api/tickets/purchase',
            data=json.dumps(request_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    @patch('src.services.database_service.DatabaseService.get_all_tickets')
    def test_get_all_tickets_endpoint(self, mock_get_all_tickets):
        """Probar endpoint para obtener todas las entradas"""
        from src.models.ticket import Ticket
        tickets = [Ticket.from_dict(self.sample_ticket)]
        mock_get_all_tickets.return_value = tickets

        response = self.client.get('/api/tickets/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], "1")
        self.assertEqual(data[0]["type"], "VIP")
        self.assertTrue(data[0]["available"])

    @patch('src.services.database_service.DatabaseService.get_ticket_by_id')
    def test_get_ticket_info_endpoint(self, mock_get_ticket):
        """Probar endpoint para obtener información de ticket específico"""
        from src.models.ticket import Ticket
        mock_get_ticket.return_value = Ticket.from_dict(self.sample_ticket)

        response = self.client.get('/api/tickets/1')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)

        self.assertEqual(data["id"], "1")
        self.assertEqual(data["type"], "VIP")
        self.assertTrue(data["available"])
        self.assertFalse(data["sold_out"])

    @patch('src.services.database_service.DatabaseService.update_ticket')
    @patch('src.services.database_service.DatabaseService.get_ticket_by_id')
    def test_update_ticket_endpoint(self, mock_get_ticket, mock_update_ticket):
        """Probar endpoint de actualización de ticket"""
        from src.models.ticket import Ticket
        original_ticket = Ticket.from_dict(self.sample_ticket)
        updated_ticket = Ticket.from_dict({
            **self.sample_ticket,
            'price': 200.0
        })

        mock_get_ticket.return_value = original_ticket
        mock_update_ticket.return_value = updated_ticket

        # Datos de actualización
        update_data = {'price': 200.0}

        response = self.client.put(
            '/api/tickets/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)

        self.assertEqual(data["price"], 200.0)
        self.assertTrue(data["available"])

    def test_health_check_endpoint(self):
        """Probar endpoint de verificación de salud"""
        response = self.client.get('/api/tickets/health')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)

        self.assertEqual(data["service"], "tickets-service")
        self.assertEqual(data["status"], "healthy")


if __name__ == '__main__':
    unittest.main()
