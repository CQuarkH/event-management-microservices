import unittest
import requests
import time
import json
from typing import Optional


class TestTicketsSmoke(unittest.TestCase):
    """
    Pruebas de humo para validar el flujo completo de compra de entradas.
    Estas pruebas asumen que tanto el servicio de tickets como el de base de datos están ejecutándose.
    """

    def setUp(self):
        """Configurar URLs base para las pruebas"""
        self.tickets_service_url = "http://localhost:5004/api/tickets"
        self.database_service_url = "http://localhost:3001/tickets"

        self.wait_for_services()

        self.test_ticket_data = {
            "type": "VIP",
            "price": 150.0,
            "quantityAvailable": 100
        }

    def wait_for_services(self, timeout=30):
        """Esperar a que los servicios estén disponibles"""
        services = [
            (f"{self.tickets_service_url}/health", "Tickets Service"),
            (f"{self.database_service_url}", "Database Service")
        ]

        for url, service_name in services:
            start_time = time.time()
            while time.time() - start_time < timeout:
                try:
                    response = requests.get(url, timeout=5)
                    if response.status_code == 200:
                        print(f"✓ {service_name} está disponible")
                        break
                except requests.RequestException:
                    pass
                time.sleep(2)
            else:
                self.skipTest(f"{service_name} no está disponible en {url}")

    def create_test_ticket(self) -> Optional[str]:
        """Crear un ticket de prueba en la base de datos"""
        try:
            response = requests.post(
                self.database_service_url,
                json=self.test_ticket_data,
                timeout=10
            )

            if response.status_code == 201:
                ticket_data = response.json()
                return ticket_data.get('id')
            else:
                print(f"Error creando ticket: {
                      response.status_code} - {response.text}")
                return None
        except requests.RequestException as e:
            print(f"Error de conexión creando ticket: {e}")
            return None

    def cleanup_ticket(self, ticket_id: str):
        """Limpiar ticket de prueba"""
        try:
            requests.delete(
                f"{self.database_service_url}/{ticket_id}", timeout=10)
        except requests.RequestException:
            pass

    def test_complete_ticket_purchase_flow(self):
        """
        Prueba de humo: Flujo completo de compra de entradas

        1. Crear ticket en BD
        2. Verificar disponibilidad
        3. Realizar compra
        4. Verificar actualización de disponibilidad
        5. Limpiar datos
        """
        print("\n🧪 Iniciando prueba de flujo completo de compra...")

        print("📝 Paso 1: Creando ticket de prueba...")
        ticket_id = self.create_test_ticket()
        self.assertIsNotNone(
            ticket_id, "Falló la creación del ticket de prueba")
        print(f"✓ Ticket creado con ID: {ticket_id}")

        try:
            print("🔍 Paso 2: Verificando disponibilidad inicial...")
            response = requests.get(
                f"{self.tickets_service_url}/availability/{ticket_id}")
            self.assertEqual(response.status_code, 200)

            availability_data = response.json()
            self.assertEqual(availability_data['ticket_id'], ticket_id)
            self.assertEqual(availability_data['available_quantity'], 100)
            self.assertTrue(availability_data['available'])
            print(f"✓ Disponibilidad inicial: {
                  availability_data['available_quantity']} entradas")

            print("📋 Paso 3: Obteniendo información del ticket...")
            response = requests.get(f"{self.tickets_service_url}/{ticket_id}")
            self.assertEqual(response.status_code, 200)

            ticket_info = response.json()
            self.assertEqual(ticket_info['id'], ticket_id)
            self.assertEqual(ticket_info['type'], 'VIP')
            self.assertEqual(ticket_info['price'], 150.0)
            print(f"✓ Info del ticket: {
                  ticket_info['type']} - ${ticket_info['price']}")

            print("💳 Paso 4: Realizando compra de 5 entradas...")
            purchase_data = {
                'ticket_id': ticket_id,
                'quantity': 5
            }

            response = requests.post(
                f"{self.tickets_service_url}/purchase",
                json=purchase_data
            )
            self.assertEqual(response.status_code, 200)

            purchase_result = response.json()
            self.assertTrue(purchase_result['success'])

            purchase_details = purchase_result['purchase']
            self.assertEqual(purchase_details['ticket_id'], ticket_id)
            self.assertEqual(purchase_details['quantity_purchased'], 5)
            self.assertEqual(purchase_details['unit_price'], 150.0)
            self.assertEqual(purchase_details['total_amount'], 750.0)
            self.assertEqual(purchase_details['remaining_available'], 95)
            print(f"✓ Compra exitosa: {purchase_details['quantity_purchased']} entradas por ${
                  purchase_details['total_amount']}")

            print("🔍 Paso 5: Verificando disponibilidad después de la compra...")
            response = requests.get(
                f"{self.tickets_service_url}/availability/{ticket_id}")
            self.assertEqual(response.status_code, 200)

            new_availability = response.json()
            self.assertEqual(new_availability['available_quantity'], 95)
            self.assertTrue(new_availability['available'])
            print(f"✓ Nueva disponibilidad: {
                  new_availability['available_quantity']} entradas")

            print("⚠️  Paso 6: Probando compra con cantidad insuficiente...")
            large_purchase_data = {
                'ticket_id': ticket_id,
                'quantity': 200
            }

            response = requests.post(
                f"{self.tickets_service_url}/purchase",
                json=large_purchase_data
            )
            self.assertEqual(response.status_code, 400)

            error_response = response.json()
            self.assertIn('error', error_response)
            self.assertIn('No hay suficientes entradas disponibles',
                          error_response['error'])
            print("✓ Validación correcta para cantidad insuficiente")

            print("🎉 ¡Flujo completo de compra exitoso!")

        finally:
            print("🧹 Limpiando datos de prueba...")
            if ticket_id:
                self.cleanup_ticket(ticket_id)
            print("✓ Limpieza completada")

    def test_ticket_not_found_scenarios(self):
        """
        Prueba de humo: Escenarios de ticket no encontrado
        """
        print("\n🔍 Probando escenarios de ticket no encontrado...")

        non_existing_ticket_id = "00000000-0000-0000-0000-000000000000"

        response = requests.get(
            f"{self.tickets_service_url}/availability/{non_existing_ticket_id}")
        self.assertEqual(response.status_code, 404)

        response = requests.get(
            f"{self.tickets_service_url}/{non_existing_ticket_id}")
        self.assertEqual(response.status_code, 404)

        purchase_data = {
            'ticket_id': non_existing_ticket_id,
            'quantity': 1
        }
        response = requests.post(
            f"{self.tickets_service_url}/purchase",
            json=purchase_data
        )
        self.assertEqual(response.status_code, 400)

        print("✓ Manejo correcto de tickets no encontrados")

    def test_service_health_check(self):
        """
        Prueba de humo: Verificar que el servicio está saludable
        """
        print("\n Verificando estado de salud del servicio de tickets...")

        response = requests.get(f"{self.tickets_service_url}/health")
        self.assertEqual(response.status_code, 200)

        health_data = response.json()
        self.assertEqual(health_data['service'], 'tickets-service')
        self.assertEqual(health_data['status'], 'healthy')

        print("✓ Servicio de tickets está saludable")

    def test_list_all_tickets(self):
        """
        Prueba de humo: Listar todas las entradas
        """
        print("\n📋 Probando listado de todas las entradas...")

        response = requests.get(f"{self.tickets_service_url}/")
        self.assertEqual(response.status_code, 200)

        tickets = response.json()
        self.assertIsInstance(tickets, list)

        print(f"✓ Listado exitoso: {len(tickets)} entradas encontradas")


if __name__ == '__main__':
    # Configurar para que muestre más información durante las pruebas
    unittest.main(verbosity=2)
