"""
Pruebas de Integración - Requiere que el servicio de BD esté corriendo
Estas pruebas hacen requests HTTP REALES al servicio de base de datos
"""
import pytest
import requests
import time
from src.app import app

# URL del servicio de BD (debe estar corriendo)
DB_SERVICE_URL = app.config['DATABASE_SERVICE_URL']

@pytest.fixture
def client():
    """Cliente de prueba de Flask"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture(scope="module")
def check_database_service():
    """
    Verifica que el servicio de BD esté corriendo antes de ejecutar tests
    Si no está disponible, salta todos los tests
    """
    try:
        response = requests.get(f"{DB_SERVICE_URL}/notifications", timeout=2)
        if response.status_code not in [200, 404]:
            pytest.skip("Database service not responding correctly")
    except requests.exceptions.RequestException:
        pytest.skip("Database service is not running. Start it with: cd database-service && npm run dev")


@pytest.fixture
def cleanup_notifications():
    """
    Limpia las notificaciones de prueba después de cada test
    Para mantener la BD limpia entre tests
    """
    yield
    
    # Cleanup después del test
    try:
        # Obtener todas las notificaciones
        response = requests.get(f"{DB_SERVICE_URL}/notifications", timeout=2)
        if response.status_code == 200:
            notifications = response.json()
            
            # Eliminar solo las de prueba (las que contienen "TEST" en el mensaje)
            for notif in notifications:
                if isinstance(notif, dict) and 'message' in notif:
                    if 'TEST' in notif['message'] or 'test' in notif['message']:
                        requests.delete(
                            f"{DB_SERVICE_URL}/notifications/{notif['id']}",
                            timeout=2
                        )
    except:
        pass  # Si falla el cleanup, no es crítico


class TestDatabaseIntegration:
    """Tests de integración con el servicio de Base de Datos REAL"""
    
    def test_database_service_is_running(self, check_database_service):
        """Verifica que el servicio de BD está corriendo"""
        response = requests.get(f"{DB_SERVICE_URL}/notifications")
        assert response.status_code in [200, 404]
    
    def test_send_email_notification_real_integration(self, client, check_database_service, cleanup_notifications):
        """
        Test de integración completo:
        1. Envía notificación EMAIL a través de nuestro servicio
        2. Verifica que se guardó en BD
        3. Verifica que se puede recuperar
        """
        # 1. Enviar notificación
        notification_data = {
            'type': 'EMAIL',
            'message': 'TEST Integration - Welcome to the event',
            'recipients': ['integration-test@example.com', 'test2@example.com']
        }
        
        response = client.post(
            '/api/notifications/send',
            json=notification_data
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['status'] == 'sent'
        assert 'notification_id' in data
        notification_id = data['notification_id']
        
        # 2. Verificar que existe en BD
        time.sleep(0.5)  # Pequeña pausa para asegurar consistencia
        
        db_response = requests.get(f"{DB_SERVICE_URL}/notifications/{notification_id}")
        assert db_response.status_code == 200
        
        saved_notification = db_response.json()
        assert saved_notification['id'] == notification_id
        assert saved_notification['type'] == 'EMAIL'
        assert saved_notification['message'] == notification_data['message']
        assert len(saved_notification['recipients']) == 2
        assert 'integration-test@example.com' in saved_notification['recipients']
    
    def test_send_sms_notification_real_integration(self, client, check_database_service, cleanup_notifications):
        """
        Test de integración para notificación SMS
        """
        notification_data = {
            'type': 'SMS',
            'message': 'TEST Integration - Your ticket is confirmed',
            'recipients': ['+56912345678', '+56987654321']
        }
        
        response = client.post(
            '/api/notifications/send',
            json=notification_data
        )
        
        assert response.status_code == 201
        data = response.get_json()
        notification_id = data['notification_id']
        
        # Verificar en BD
        time.sleep(0.5)
        db_response = requests.get(f"{DB_SERVICE_URL}/notifications/{notification_id}")
        assert db_response.status_code == 200
        
        saved_notification = db_response.json()
        assert saved_notification['type'] == 'SMS'
        assert len(saved_notification['recipients']) == 2
    
    def test_get_history_real_integration(self, client, check_database_service, cleanup_notifications):
        """
        Test de integración para obtener historial:
        1. Envía 2 notificaciones
        2. Obtiene el historial
        3. Verifica que ambas están presentes
        """
        # Enviar 2 notificaciones
        notif1 = {
            'type': 'EMAIL',
            'message': 'TEST Integration History - First notification',
            'recipients': ['test1@example.com']
        }
        
        notif2 = {
            'type': 'SMS',
            'message': 'TEST Integration History - Second notification',
            'recipients': ['+56911111111']
        }
        
        response1 = client.post('/api/notifications/send', json=notif1)
        assert response1.status_code == 201
        id1 = response1.get_json()['notification_id']
        
        time.sleep(0.3)
        
        response2 = client.post('/api/notifications/send', json=notif2)
        assert response2.status_code == 201
        id2 = response2.get_json()['notification_id']
        
        time.sleep(0.5)
        
        # Obtener historial
        history_response = client.get('/api/notifications/history')
        assert history_response.status_code == 200
        
        history_data = history_response.get_json()
        assert 'notifications' in history_data
        notifications = history_data['notifications']
        
        # Verificar que nuestras notificaciones están en el historial
        notification_ids = [n['id'] for n in notifications if isinstance(n, dict) and 'id' in n]
        assert id1 in notification_ids
        assert id2 in notification_ids
    
    def test_get_notification_by_id_real_integration(self, client, check_database_service, cleanup_notifications):
        """
        Test de integración para obtener notificación por ID
        """
        # Crear notificación
        notification_data = {
            'type': 'EMAIL',
            'message': 'TEST Integration GetByID - Specific notification',
            'recipients': ['specific@test.com']
        }
        
        create_response = client.post('/api/notifications/send', json=notification_data)
        assert create_response.status_code == 201
        notification_id = create_response.get_json()['notification_id']
        
        time.sleep(0.5)
        
        # Obtener por ID
        get_response = client.get(f'/api/notifications/{notification_id}')
        assert get_response.status_code == 200
        
        notification = get_response.get_json()
        assert notification['id'] == notification_id
        assert notification['type'] == 'EMAIL'
        assert notification['message'] == notification_data['message']
    
    def test_get_nonexistent_notification(self, client, check_database_service):
        """
        Test de integración: obtener notificación que no existe
        """
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f'/api/notifications/{fake_id}')
        
        # Puede ser 404 o 500 dependiendo de cómo maneje el servicio de BD
        assert response.status_code in [404, 500]
    
    def test_health_check_with_real_database(self, client, check_database_service):
        """
        Test de integración: health check cuando BD está disponible
        """
        response = client.get('/api/notifications/health')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['service'] == 'notifications'
        assert data['database_connection'] == 'ok'


class TestDatabaseErrorHandling:
    """Tests de manejo de errores cuando BD tiene problemas"""
    
    def test_invalid_notification_type(self, client, check_database_service):
        """
        Test: el servicio de BD rechaza tipos inválidos
        """
        invalid_data = {
            'type': 'WHATSAPP',  # tipo inválido
            'message': 'TEST - Invalid type',
            'recipients': ['test@example.com']
        }
        
        response = client.post('/api/notifications/send', json=invalid_data)
        
        # Nuestro servicio debe rechazarlo en validación
        assert response.status_code == 400
        data = response.get_json()
        assert 'errors' in data
    
    def test_send_notification_with_empty_recipients(self, client, check_database_service):
        """
        Test: rechazar notificación sin destinatarios
        """
        invalid_data = {
            'type': 'EMAIL',
            'message': 'TEST - No recipients',
            'recipients': []
        }
        
        response = client.post('/api/notifications/send', json=invalid_data)
        assert response.status_code == 400


class TestPerformance:
    """Tests básicos de rendimiento"""
    
    def test_send_notification_response_time(self, client, check_database_service, cleanup_notifications):
        """
        Test: verificar que el envío de notificación es rápido (<2 segundos)
        """
        notification_data = {
            'type': 'EMAIL',
            'message': 'TEST Performance - Speed test',
            'recipients': ['perf@test.com']
        }
        
        import time
        start_time = time.time()
        
        response = client.post('/api/notifications/send', json=notification_data)
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        assert response.status_code == 201
        assert elapsed_time < 2.0, f"Request took {elapsed_time:.2f} seconds, should be < 2s"
    
    def test_get_history_response_time(self, client, check_database_service):
        """
        Test: verificar que obtener historial es rápido (<1 segundo)
        """
        import time
        start_time = time.time()
        
        response = client.get('/api/notifications/history')
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        
        assert response.status_code == 200
        assert elapsed_time < 1.0, f"Request took {elapsed_time:.2f} seconds, should be < 1s"