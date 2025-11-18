import unittest
from unittest.mock import Mock, patch
from src.services.tickets_service import TicketsService
from src.models.ticket import Ticket


class TestTicketsService(unittest.TestCase):

    def setUp(self):
        """Configurar mocks y datos de prueba"""
        self.tickets_service = TicketsService()
        self.tickets_service.db_service = Mock()

        self.sample_ticket = Ticket(
            id="1",
            type='VIP',
            price=150.0,
            quantity_available=50,
            quantity_sold=10
        )

    def test_check_availability_existing_ticket(self):
        """Probar verificación de disponibilidad para ticket existente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket

        result = self.tickets_service.check_availability("1")

        self.assertEqual(result, 50)
        self.tickets_service.db_service.get_ticket_by_id.assert_called_once_with(
            "1")

    def test_check_availability_non_existing_ticket(self):
        """Probar verificación de disponibilidad para ticket inexistente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = None

        result = self.tickets_service.check_availability("999")

        self.assertIsNone(result)
        self.tickets_service.db_service.get_ticket_by_id.assert_called_once_with(
            "999")

    def test_check_availability_for_quantity_sufficient(self):
        """Probar verificación de disponibilidad para cantidad suficiente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket

        result = self.tickets_service.check_availability_for_quantity("1", 30)

        self.assertTrue(result)

    def test_check_availability_for_quantity_insufficient(self):
        """Probar verificación de disponibilidad para cantidad insuficiente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket

        result = self.tickets_service.check_availability_for_quantity("1", 60)

        self.assertFalse(result)

    def test_check_availability_for_quantity_non_existing(self):
        """Probar verificación de disponibilidad para ticket inexistente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = None

        result = self.tickets_service.check_availability_for_quantity("999", 5)

        self.assertFalse(result)

    def test_purchase_tickets_successful(self):
        """Probar compra exitosa de tickets"""
        updated_ticket = Ticket(
            id="1",
            type='VIP',
            price=150.0,
            quantity_available=45,
            quantity_sold=15
        )

        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket
        self.tickets_service.db_service.update_ticket.return_value = updated_ticket

        result = self.tickets_service.purchase_tickets("1", 5)

        expected = {
            "ticket_id": "1",
            "ticket_type": "VIP",
            "quantity_purchased": 5,
            "unit_price": 150.0,
            "total_amount": 750.0,
            "remaining_available": 45
        }
        self.assertEqual(result, expected)

        self.tickets_service.db_service.get_ticket_by_id.assert_called_once_with(
            "1")
        expected_update_data = {
            "quantityAvailable": 45,
            "quantitySold": 15
        }
        self.tickets_service.db_service.update_ticket.assert_called_once_with(
            "1", expected_update_data)

    def test_purchase_tickets_non_existing(self):
        """Probar compra de tickets inexistentes"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = None

        with self.assertRaises(ValueError) as context:
            self.tickets_service.purchase_tickets("999", 5)

        self.assertIn("Entrada con ID 999 no encontrada",
                      str(context.exception))

    def test_purchase_tickets_insufficient_quantity(self):
        """Probar compra con cantidad insuficiente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket

        with self.assertRaises(ValueError) as context:
            self.tickets_service.purchase_tickets("1", 60)

        self.assertIn("No hay suficientes entradas disponibles",
                      str(context.exception))

    def test_get_all_tickets(self):
        """Probar obtención de todas las entradas"""
        tickets = [self.sample_ticket]
        self.tickets_service.db_service.get_all_tickets.return_value = tickets

        result = self.tickets_service.get_all_tickets()

        expected = [
            {
                **self.sample_ticket.to_dict(),
                "available": True
            }
        ]
        self.assertEqual(result, expected)

    def test_get_ticket_info_existing(self):
        """Probar obtención de información de ticket existente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket

        result = self.tickets_service.get_ticket_info("1")

        expected = {
            **self.sample_ticket.to_dict(),
            "available": True,
            "sold_out": False
        }
        self.assertEqual(result, expected)

    def test_get_ticket_info_non_existing(self):
        """Probar obtención de información de ticket inexistente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = None

        result = self.tickets_service.get_ticket_info("999")

        self.assertIsNone(result)

    def test_update_ticket_info_successful(self):
        """Probar actualización exitosa de información de ticket"""
        updated_ticket = Ticket(
            id="1",
            type='VIP',
            price=200.0,
            quantity_available=50,
            quantity_sold=10
        )

        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket
        self.tickets_service.db_service.update_ticket.return_value = updated_ticket

        update_data = {"price": 200.0}
        result = self.tickets_service.update_ticket_info("1", update_data)

        expected = {
            **updated_ticket.to_dict(),
            "available": True
        }
        self.assertEqual(result, expected)

    def test_update_ticket_info_non_existing(self):
        """Probar actualización de ticket inexistente"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = None

        with self.assertRaises(ValueError) as context:
            self.tickets_service.update_ticket_info("999", {"price": 200.0})

        self.assertIn("Entrada con ID 999 no encontrada",
                      str(context.exception))

    def test_update_ticket_info_invalid_fields(self):
        """Probar actualización con campos inválidos"""
        self.tickets_service.db_service.get_ticket_by_id.return_value = self.sample_ticket

        with self.assertRaises(ValueError) as context:
            self.tickets_service.update_ticket_info(
                "1", {"invalid_field": "value"})

        self.assertIn("No se proporcionaron campos válidos",
                      str(context.exception))


if __name__ == '__main__':
    unittest.main()
