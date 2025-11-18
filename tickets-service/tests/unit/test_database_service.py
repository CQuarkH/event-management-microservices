import unittest
from unittest.mock import Mock, patch
import requests
from src.services.database_service import DatabaseService
from src.models.ticket import Ticket


class TestDatabaseService(unittest.TestCase):

    def setUp(self):
        """Configurar el servicio de base de datos para pruebas"""
        self.service = DatabaseService()
        self.sample_ticket_data = {
            'id': "1",
            'type': 'VIP',
            'price': 150.0,
            'quantity_available': 50,
            'quantity_sold': 10
        }

    @patch('requests.get')
    def test_get_all_tickets_success(self, mock_get):
        """Probar obtención exitosa de todas las entradas"""
        mock_response = Mock()
        mock_response.json.return_value = [self.sample_ticket_data]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        result = self.service.get_all_tickets()

        self.assertEqual(len(result), 1)
        self.assertIsInstance(result[0], Ticket)
        self.assertEqual(result[0].id, "1")
        mock_get.assert_called_once_with(f"{self.service.base_url}/tickets")

    @patch('requests.get')
    def test_get_all_tickets_request_exception(self, mock_get):
        """Probar manejo de excepción en get_all_tickets"""
        mock_get.side_effect = requests.RequestException("Connection error")

        with self.assertRaises(Exception) as context:
            self.service.get_all_tickets()

        self.assertIn("Error al obtener entradas", str(context.exception))
        self.assertIn("Connection error", str(context.exception))

    @patch('requests.get')
    def test_get_ticket_by_id_success(self, mock_get):
        """Probar obtención exitosa de ticket por ID"""
        mock_response = Mock()
        mock_response.json.return_value = self.sample_ticket_data
        mock_response.raise_for_status.return_value = None
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        result = self.service.get_ticket_by_id("1")

        self.assertIsInstance(result, Ticket)
        self.assertEqual(result.id, "1")
        mock_get.assert_called_once_with(f"{self.service.base_url}/tickets/1")

    @patch('requests.get')
    def test_get_ticket_by_id_not_found(self, mock_get):
        """Probar manejo de ticket no encontrado"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        result = self.service.get_ticket_by_id("999")

        self.assertIsNone(result)
        mock_get.assert_called_once_with(
            f"{self.service.base_url}/tickets/999")

    @patch('requests.get')
    def test_get_ticket_by_id_request_exception(self, mock_get):
        """Probar manejo de excepción en get_ticket_by_id"""
        mock_get.side_effect = requests.RequestException("Network error")

        with self.assertRaises(Exception) as context:
            self.service.get_ticket_by_id("1")

        self.assertIn("Error al obtener entrada 1", str(context.exception))
        self.assertIn("Network error", str(context.exception))

    @patch('requests.put')
    def test_update_ticket_success(self, mock_put):
        """Probar actualización exitosa de ticket"""
        mock_response = Mock()
        updated_data = {**self.sample_ticket_data, 'price': 200.0}
        mock_response.json.return_value = updated_data
        mock_response.raise_for_status.return_value = None
        mock_put.return_value = mock_response

        update_data = {'price': 200.0}

        result = self.service.update_ticket("1", update_data)

        self.assertIsInstance(result, Ticket)
        self.assertEqual(result.price, 200.0)
        mock_put.assert_called_once_with(
            f"{self.service.base_url}/tickets/1",
            json=update_data
        )

    @patch('requests.put')
    def test_update_ticket_request_exception(self, mock_put):
        """Probar manejo de excepción en update_ticket"""
        mock_put.side_effect = requests.RequestException("Update failed")

        with self.assertRaises(Exception) as context:
            self.service.update_ticket("1", {'price': 200.0})

        self.assertIn("Error al actualizar entrada 1", str(context.exception))
        self.assertIn("Update failed", str(context.exception))

    @patch('requests.post')
    def test_create_ticket_success(self, mock_post):
        """Probar creación exitosa de ticket"""
        mock_response = Mock()
        mock_response.json.return_value = self.sample_ticket_data
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response

        create_data = {
            'type': 'VIP',
            'price': 150.0,
            'quantity_available': 50
        }

        result = self.service.create_ticket(create_data)

        self.assertIsInstance(result, Ticket)
        self.assertEqual(result.type, 'VIP')
        mock_post.assert_called_once_with(
            f"{self.service.base_url}/tickets",
            json=create_data
        )

    @patch('requests.post')
    def test_create_ticket_request_exception(self, mock_post):
        """Probar manejo de excepción en create_ticket"""
        mock_post.side_effect = requests.RequestException("Creation failed")

        with self.assertRaises(Exception) as context:
            self.service.create_ticket({'type': 'VIP'})

        self.assertIn("Error al crear entrada", str(context.exception))
        self.assertIn("Creation failed", str(context.exception))

    @patch('requests.delete')
    def test_delete_ticket_success(self, mock_delete):
        """Probar eliminación exitosa de ticket"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_delete.return_value = mock_response

        result = self.service.delete_ticket("1")

        self.assertTrue(result)
        mock_delete.assert_called_once_with(
            f"{self.service.base_url}/tickets/1")

    @patch('requests.delete')
    def test_delete_ticket_failure(self, mock_delete):
        """Probar fallo en eliminación de ticket"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_delete.return_value = mock_response

        result = self.service.delete_ticket("999")

        self.assertFalse(result)
        mock_delete.assert_called_once_with(
            f"{self.service.base_url}/tickets/999")

    @patch('requests.delete')
    def test_delete_ticket_request_exception(self, mock_delete):
        """Probar manejo de excepción en delete_ticket"""
        mock_delete.side_effect = requests.RequestException("Delete failed")

        with self.assertRaises(Exception) as context:
            self.service.delete_ticket("1")

        self.assertIn("Error al eliminar entrada 1", str(context.exception))
        self.assertIn("Delete failed", str(context.exception))

    def test_init_sets_base_url(self):
        """Probar que el constructor establece la URL base correctamente"""
        service = DatabaseService()
        expected_url = "http://localhost:3000"
        self.assertIn("localhost", service.base_url)


if __name__ == '__main__':
    unittest.main()
