import pytest
import requests
import time
import os

# =================== CONFIGURACIÓN ===================

# Detectar si estamos en Docker o local
SERVICES = {
    'database': os.getenv('DATABASE_SERVICE_URL', 'http://localhost:3000'),
    'attendees': os.getenv('ATTENDEES_SERVICE_URL', 'http://localhost:5001'),
    'tickets': os.getenv('TICKETS_SERVICE_URL', 'http://localhost:5002'),
    'notifications': os.getenv('NOTIFICATIONS_SERVICE_URL', 'http://localhost:5003')
}

TIMEOUT = 5

print(f"""
╔═══════════════════════════════════════════════════════╗
║   Sistema de Gestión de Eventos - Pruebas de Humo    ║
╚═══════════════════════════════════════════════════════╝

📍 Configuración de Servicios:
   Database:      {SERVICES['database']}
   Attendees:     {SERVICES['attendees']}
   Tickets:       {SERVICES['tickets']}
   Notifications: {SERVICES['notifications']}
""")

# =================== FIXTURES ===================

@pytest.fixture(scope="module")
def check_all_services():
    """Verifica que todos los servicios estén corriendo"""
    print("\n🔍 Verificando disponibilidad de servicios...")
    
    unavailable_services = []
    
    for service_name, base_url in SERVICES.items():
        try:
            if service_name == 'database':
                response = requests.get(f"{base_url}/events", timeout=5)
            elif service_name == 'attendees':
                response = requests.get(f"{base_url}", timeout=5)
            else:
                endpoint = 'api/tickets/health' if service_name == 'tickets' else 'api/notifications/health'
                response = requests.get(f"{base_url}/{endpoint}", timeout=5)
            
            if response.status_code in [200, 404]:
                print(f"✅ {service_name.upper()} service - OK")
            else:
                unavailable_services.append(service_name)
                print(f"❌ {service_name.upper()} service - ERROR")
                
        except requests.exceptions.RequestException:
            unavailable_services.append(service_name)
            print(f"❌ {service_name.upper()} service - UNREACHABLE")
    
    if unavailable_services:
        pytest.skip(
            f"Servicios no disponibles: {', '.join(unavailable_services)}"
        )
    
    print("✅ Todos los servicios están disponibles\n")


@pytest.fixture
def cleanup_test_data():
    """Limpia datos de prueba después de cada test"""
    created_ids = {
        'events': [],
        'attendees': [],
        'tickets': [],
        'notifications': []
    }
    
    yield created_ids
    
    # Cleanup
    print("\n🧹 Limpiando datos de prueba...")
    
    for notif_id in created_ids.get('notifications', []):
        try:
            requests.delete(f"{SERVICES['database']}/notifications/{notif_id}", timeout=2)
        except:
            pass
    
    for attendee_id in created_ids.get('attendees', []):
        try:
            requests.delete(f"{SERVICES['attendees']}/api/attendees/{attendee_id}", timeout=2)
        except:
            pass
    
    for ticket_id in created_ids.get('tickets', []):
        try:
            requests.delete(f"{SERVICES['database']}/tickets/{ticket_id}", timeout=2)
        except:
            pass
    
    for event_id in created_ids.get('events', []):
        try:
            requests.delete(f"{SERVICES['database']}/events/{event_id}", timeout=2)
        except:
            pass
    
    print("✅ Limpieza completada")


# =================== PRUEBAS DE HUMO ===================

class TestCompleteUserJourney:
    """Pruebas de humo de flujos completos de usuario"""
    
    def test_01_complete_event_registration_flow(self, check_all_services, cleanup_test_data):
        """
        FLUJO COMPLETO: Registro de asistente + Notificación
        """
        print("\n" + "="*70)
        print("🎯 TEST 1: Flujo Completo de Registro de Asistente")
        print("="*70)
        
        # PASO 1: Crear evento
        print("\n📅 PASO 1: Creando evento...")
        event_data = {
            "name": "Tech Conference 2024",
            "date": "2024-12-15T09:00:00Z",
            "location": "Santiago, Chile",
            "type": "Conferencia",
            "description": "Conferencia de tecnología"
        }
        
        response = requests.post(
            f"{SERVICES['database']}/events",
            json=event_data,
            timeout=TIMEOUT
        )
        
        assert response.status_code in [200, 201], f"Failed to create event: {response.text}"
        event = response.json()
        event_id = event['id']
        cleanup_test_data['events'].append(event_id)
        
        print(f"✅ Evento creado: {event['name']} (ID: {event_id[:8]}...)")
        
        # PASO 2: Registrar asistente
        print("\n👤 PASO 2: Registrando asistente...")
        attendee_data = {
            "name": "Juan Pérez",
            "email": "juan.perez.smoke.test@example.com",
            "phone": "+56912345678",
            "eventId": event_id
        }
        
        response = requests.post(
            f"{SERVICES['attendees']}/api/attendees",
            json=attendee_data,
            timeout=TIMEOUT
        )
        
        assert response.status_code in [200, 201], f"Failed to register: {response.text}"
        attendee = response.json()
        attendee_id = attendee.get('id') or attendee.get('attendee', {}).get('id')
        cleanup_test_data['attendees'].append(attendee_id)
        
        print(f"✅ Asistente registrado: {attendee_data['name']}")
        
        # PASO 3: Enviar notificación
        print("\n📧 PASO 3: Enviando notificación de bienvenida...")
        notification_data = {
            "type": "EMAIL",
            "message": f"¡Bienvenido {attendee_data['name']} a {event['name']}!",
            "recipients": [attendee_data['email']]
        }
        
        response = requests.post(
            f"{SERVICES['notifications']}/api/notifications/send",
            json=notification_data,
            timeout=TIMEOUT
        )
        
        assert response.status_code == 201, f"Failed to send notification: {response.text}"
        notif_result = response.json()
        notification_id = notif_result['notification_id']
        cleanup_test_data['notifications'].append(notification_id)
        
        print(f"✅ Notificación enviada (ID: {notification_id[:8]}...)")
        
        # PASO 4: Verificar en BD
        print("\n🔍 PASO 4: Verificando notificación en BD...")
        time.sleep(0.5)
        
        response = requests.get(
            f"{SERVICES['notifications']}/api/notifications/{notification_id}",
            timeout=TIMEOUT
        )
        
        assert response.status_code == 200
        saved_notification = response.json()
        assert saved_notification['type'] == 'EMAIL'
        
        print(f"✅ Notificación verificada en BD")
        print("\n" + "="*70)
        print("✅ TEST 1: EXITOSO")
        print("="*70)
    
    
    def test_02_complete_ticket_purchase_flow(self, check_all_services, cleanup_test_data):
        """
        FLUJO COMPLETO: Compra de entrada + Notificación
        """
        print("\n" + "="*70)
        print("🎯 TEST 2: Flujo Completo de Compra de Entrada")
        print("="*70)
        
        # Crear evento
        print("\n📅 Creando evento...")
        event_data = {
            "name": "Concierto Rock 2024",
            "date": "2024-12-20T20:00:00Z",
            "location": "Movistar Arena",
            "type": "Concierto"
        }
        
        response = requests.post(f"{SERVICES['database']}/events", json=event_data, timeout=TIMEOUT)
        assert response.status_code in [200, 201]
        event_id = response.json()['id']
        cleanup_test_data['events'].append(event_id)
        print(f"✅ Evento creado")
        
        # Crear ticket
        print("\n🎫 Creando ticket VIP...")
        ticket_data = {
            "type": "VIP",
            "price": 50000,
            "quantityAvailable": 50,
            "eventId": event_id
        }
        
        response = requests.post(f"{SERVICES['database']}/tickets", json=ticket_data, timeout=TIMEOUT)
        assert response.status_code in [200, 201]
        ticket_id = response.json()['id']
        cleanup_test_data['tickets'].append(ticket_id)
        print(f"✅ Ticket VIP creado (50 disponibles)")
        
        # Registrar asistente
        print("\n👤 Registrando asistente...")
        attendee_data = {
            "name": "María González",
            "email": "maria.gonzalez.smoke@example.com",
            "eventId": event_id
        }
        
        response = requests.post(f"{SERVICES['attendees']}/api/attendees", json=attendee_data, timeout=TIMEOUT)
        assert response.status_code in [200, 201]
        attendee_id = response.json().get('id') or response.json().get('attendee', {}).get('id')
        cleanup_test_data['attendees'].append(attendee_id)
        print(f"✅ Asistente registrado")
        
        # Verificar disponibilidad
        print("\n🔍 Verificando disponibilidad...")
        response = requests.get(f"{SERVICES['tickets']}/api/tickets/availability/{ticket_id}", timeout=TIMEOUT)
        assert response.status_code == 200
        assert response.json()['available_quantity'] == 50
        print(f"✅ Disponibilidad confirmada: 50 tickets")
        
        # Comprar
        print("\n💳 Comprando 2 entradas VIP...")
        purchase_data = {"ticket_id": ticket_id, "quantity": 2}
        response = requests.post(f"{SERVICES['tickets']}/api/tickets/purchase", json=purchase_data, timeout=TIMEOUT)
        assert response.status_code == 200
        purchase = response.json()['purchase']
        print(f"✅ Compra exitosa: {purchase['quantity_purchased']} entradas")
        print(f"   Total: ${purchase['total_amount']:,.0f}")
        
        # Notificación de confirmación
        print("\n📧 Enviando confirmación...")
        notif_data = {
            "type": "EMAIL",
            "message": f"Compra confirmada: {purchase['quantity_purchased']} entradas VIP",
            "recipients": [attendee_data['email']]
        }
        response = requests.post(f"{SERVICES['notifications']}/api/notifications/send", json=notif_data, timeout=TIMEOUT)
        assert response.status_code == 201
        cleanup_test_data['notifications'].append(response.json()['notification_id'])
        print(f"✅ Notificación enviada")
        
        # Verificar inventario actualizado
        print("\n🔍 Verificando inventario actualizado...")
        time.sleep(0.5)
        response = requests.get(f"{SERVICES['tickets']}/api/tickets/availability/{ticket_id}", timeout=TIMEOUT)
        assert response.status_code == 200
        assert response.json()['available_quantity'] == 48
        print(f"✅ Inventario actualizado: 48 disponibles")
        
        print("\n" + "="*70)
        print("✅ TEST 2: EXITOSO")
        print("="*70)
    
    
    def test_03_attendee_cancellation_flow(self, check_all_services, cleanup_test_data):
        """
        FLUJO COMPLETO: Cancelación + Notificación
        """
        print("\n" + "="*70)
        print("🎯 TEST 3: Flujo de Cancelación")
        print("="*70)
        
        # Crear evento
        event_data = {
            "name": "Workshop Python",
            "date": "2024-12-10T15:00:00Z",
            "location": "Online",
            "type": "Workshop"
        }
        response = requests.post(f"{SERVICES['database']}/events", json=event_data, timeout=TIMEOUT)
        event_id = response.json()['id']
        cleanup_test_data['events'].append(event_id)
        
        # Registrar asistente
        attendee_data = {
            "name": "Carlos Rodríguez",
            "email": "carlos.smoke@example.com",
            "eventId": event_id
        }
        response = requests.post(f"{SERVICES['attendees']}/api/attendees", json=attendee_data, timeout=TIMEOUT)
        attendee_id = response.json().get('id') or response.json().get('attendee', {}).get('id')
        cleanup_test_data['attendees'].append(attendee_id)
        print("✅ Asistente registrado")
        
        # Confirmar
        print("✅ Confirmando asistencia...")
        response = requests.patch(f"{SERVICES['attendees']}/api/attendees/{attendee_id}/confirm", timeout=TIMEOUT)
        assert response.status_code in [200, 204]
        
        # Cancelar
        print("❌ Cancelando asistencia...")
        response = requests.delete(f"{SERVICES['attendees']}/api/attendees/{attendee_id}", timeout=TIMEOUT)
        assert response.status_code in [200, 204]
        print("✅ Cancelación exitosa")
        
        # Notificación
        print("📧 Enviando notificación de cancelación...")
        notif_data = {
            "type": "EMAIL",
            "message": "Tu asistencia ha sido cancelada",
            "recipients": [attendee_data['email']]
        }
        response = requests.post(f"{SERVICES['notifications']}/api/notifications/send", json=notif_data, timeout=TIMEOUT)
        cleanup_test_data['notifications'].append(response.json()['notification_id'])
        print("✅ Notificación enviada")
        
        print("\n" + "="*70)
        print("✅ TEST 3: EXITOSO")
        print("="*70)


class TestServiceCommunication:
    """Tests de comunicación entre servicios"""
    
    def test_04_notifications_database_communication(self, check_all_services, cleanup_test_data):
        """Valida comunicación Notifications ↔ Database"""
        print("\n🔗 TEST 4: Comunicación Notifications ↔ Database")
        
        notif_data = {
            "type": "SMS",
            "message": "Test comunicación",
            "recipients": ["+56999999999"]
        }
        response = requests.post(f"{SERVICES['notifications']}/api/notifications/send", json=notif_data, timeout=TIMEOUT)
        assert response.status_code == 201
        notif_id = response.json()['notification_id']
        cleanup_test_data['notifications'].append(notif_id)
        
        time.sleep(0.3)
        response = requests.get(f"{SERVICES['database']}/notifications/{notif_id}", timeout=TIMEOUT)
        assert response.status_code == 200
        print("✅ Comunicación verificada")
    
    
    def test_05_tickets_database_communication(self, check_all_services, cleanup_test_data):
        """Valida comunicación Tickets ↔ Database"""
        print("\n🔗 TEST 5: Comunicación Tickets ↔ Database")
        
        ticket_data = {"type": "general", "price": 10000, "quantityAvailable": 100}
        response = requests.post(f"{SERVICES['database']}/tickets", json=ticket_data, timeout=TIMEOUT)
        ticket_id = response.json()['id']
        cleanup_test_data['tickets'].append(ticket_id)
        
        response = requests.get(f"{SERVICES['tickets']}/api/tickets/availability/{ticket_id}", timeout=TIMEOUT)
        assert response.status_code == 200
        assert response.json()['available_quantity'] == 100
        print("✅ Comunicación verificada")


class TestSystemHealth:
    """Tests de salud del sistema"""
    
    def test_06_all_services_health(self, check_all_services):
        """Verifica health checks de todos los servicios"""
        print("\n💚 TEST 6: Health Checks del Sistema")
        
        # Notifications
        response = requests.get(f"{SERVICES['notifications']}/api/notifications/health", timeout=TIMEOUT)
        assert response.status_code == 200
        assert response.json()['status'] == 'healthy'
        print("✅ Notifications Service: healthy")
        
        # Tickets
        response = requests.get(f"{SERVICES['tickets']}/api/tickets/health", timeout=TIMEOUT)
        assert response.status_code == 200
        print("✅ Tickets Service: healthy")
        
        # Database
        response = requests.get(f"{SERVICES['database']}/events", timeout=TIMEOUT)
        assert response.status_code == 200
        print("✅ Database Service: healthy")
        
        print("✅ Todos los servicios están saludables")
    
    
    def test_07_notifications_history(self, check_all_services):
        """Valida recuperación de historial"""
        print("\n📜 TEST 7: Historial de Notificaciones")
        
        response = requests.get(f"{SERVICES['notifications']}/api/notifications/history", timeout=TIMEOUT)
        assert response.status_code == 200
        history = response.json()
        assert 'notifications' in history
        print(f"✅ Historial recuperado: {len(history['notifications'])} notificaciones")


# =================== RESUMEN FINAL ===================

def pytest_sessionfinish(session, exitstatus):
    """Hook que se ejecuta al finalizar todos los tests"""
    print("\n")
    print("╔═══════════════════════════════════════════════════════╗")
    print("║                                                       ║")
    if exitstatus == 0:
        print("║          ✅  PRUEBAS DE HUMO EXITOSAS ✅              ║")
    else:
        print("║          ❌  ALGUNAS PRUEBAS FALLARON ❌              ║")
    print("║                                                       ║")
    print("╚═══════════════════════════════════════════════════════╝")
    print("")


if __name__ == '__main__':
    pytest.main([__file__, '-v', '-s'])