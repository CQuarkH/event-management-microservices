import unittest
from src.models.ticket import Ticket, TicketPurchase


class TestTicket(unittest.TestCase):

    def setUp(self):
        """Configurar datos de prueba"""
        self.ticket_data = {
            'id': "1",
            'type': 'VIP',
            'price': 150.0,
            'quantity_available': 50,
            'quantity_sold': 10
        }

    def test_ticket_creation(self):
        """Probar creación de ticket"""
        ticket = Ticket(
            id="1",
            type='VIP',
            price=150.0,
            quantity_available=50,
            quantity_sold=10
        )

        self.assertEqual(ticket.id, "1")
        self.assertEqual(ticket.type, 'VIP')
        self.assertEqual(ticket.price, 150.0)
        self.assertEqual(ticket.quantity_available, 50)
        self.assertEqual(ticket.quantity_sold, 10)

    def test_ticket_from_dict(self):
        """Probar creación de ticket desde diccionario"""
        ticket = Ticket.from_dict(self.ticket_data)

        self.assertEqual(ticket.id, "1")
        self.assertEqual(ticket.type, 'VIP')
        self.assertEqual(ticket.price, 150.0)
        self.assertEqual(ticket.quantity_available, 50)
        self.assertEqual(ticket.quantity_sold, 10)

    def test_ticket_to_dict(self):
        """Probar conversión de ticket a diccionario"""
        ticket = Ticket.from_dict(self.ticket_data)
        result = ticket.to_dict()

        self.assertEqual(result, self.ticket_data)

    def test_ticket_default_values(self):
        """Probar valores por defecto del ticket"""
        ticket = Ticket()

        self.assertIsNone(ticket.id)
        self.assertEqual(ticket.type, 'general')
        self.assertEqual(ticket.price, 0.0)
        self.assertEqual(ticket.quantity_available, 0)
        self.assertEqual(ticket.quantity_sold, 0)

    def test_ticket_purchase_creation(self):
        """Probar creación de TicketPurchase"""
        purchase = TicketPurchase(ticket_id="1", quantity=5)

        self.assertEqual(purchase.ticket_id, "1")
        self.assertEqual(purchase.quantity, 5)

    def test_ticket_purchase_to_dict(self):
        """Probar conversión de TicketPurchase a diccionario"""
        purchase = TicketPurchase(ticket_id="1", quantity=5)
        result = purchase.to_dict()

        expected = {
            'ticket_id': "1",
            'quantity': 5
        }
        self.assertEqual(result, expected)

    def test_ticket_from_dict_with_camelcase(self):
        """Probar creación de ticket desde diccionario con camelCase (desde API BD)"""
        camelcase_data = {
            'id': "1",
            'type': 'VIP',
            'price': 150.0,
            'quantityAvailable': 50,
            'quantitySold': 10
        }

        ticket = Ticket.from_dict(camelcase_data)

        self.assertEqual(ticket.id, "1")
        self.assertEqual(ticket.type, 'VIP')
        self.assertEqual(ticket.price, 150.0)
        self.assertEqual(ticket.quantity_available, 50)
        self.assertEqual(ticket.quantity_sold, 10)


if __name__ == '__main__':
    unittest.main()
