import pytest
from src.app import validate_notification_data
from unittest.mock import patch, Mock
import json

class TestValidation:
    """Tests para validación de datos - TDD Fase RED"""
    
    def test_validate_valid_email_notification(self, valid_email_notification):
        """Debe aceptar notificación EMAIL válida"""
        errors = validate_notification_data(valid_email_notification)
        assert errors == []
    
    def test_validate_valid_sms_notification(self, valid_sms_notification):
        """Debe aceptar notificación SMS válida"""
        errors = validate_notification_data(valid_sms_notification)
        assert errors == []
    
    def test_validate_missing_type(self):
        """Debe rechazar notificación sin campo 'type'"""
        data = {'message': 'Test', 'recipients': ['user@test.com']}
        errors = validate_notification_data(data)
        assert len(errors) > 0
        assert any('type' in error.lower() for error in errors)
    
    def test_validate_invalid_type(self):
        """Debe rechazar tipos inválidos (solo EMAIL/SMS permitidos)"""
        data = {
            'type': 'WHATSAPP',
            'message': 'Test',
            'recipients': ['user@test.com']
        }
        errors = validate_notification_data(data)
        assert len(errors) > 0
        assert any('email' in error.lower() or 'sms' in error.lower() for error in errors)
    
    def test_validate_lowercase_type(self):
        """Debe rechazar tipo en minúsculas (debe ser EMAIL/SMS en mayúsculas)"""
        data = {
            'type': 'email',  # minúsculas
            'message': 'Test',
            'recipients': ['user@test.com']
        }
        errors = validate_notification_data(data)
        assert len(errors) > 0
    
    def test_validate_missing_message(self):
        """Debe rechazar notificación sin mensaje"""
        data = {'type': 'EMAIL', 'recipients': ['user@test.com']}
        errors = validate_notification_data(data)
        assert len(errors) > 0
        assert any('message' in error.lower() for error in errors)
    
    def test_validate_empty_message(self):
        """Debe rechazar mensaje vacío o solo espacios"""
        data = {
            'type': 'EMAIL',
            'message': '   ',
            'recipients': ['user@test.com']
        }
        errors = validate_notification_data(data)
        assert len(errors) > 0
    
    def test_validate_missing_recipients(self):
        """Debe rechazar notificación sin destinatarios"""
        data = {'type': 'EMAIL', 'message': 'Test'}
        errors = validate_notification_data(data)
        assert len(errors) > 0
        assert any('recipients' in error.lower() for error in errors)
    
    def test_validate_empty_recipients_list(self):
        """Debe rechazar lista de destinatarios vacía"""
        data = {
            'type': 'SMS',
            'message': 'Test',
            'recipients': []
        }
        errors = validate_notification_data(data)
        assert len(errors) > 0
    
    def test_validate_recipients_not_list(self):
        """Debe rechazar recipients que no sea lista"""
        data = {
            'type': 'EMAIL',
            'message': 'Test',
            'recipients': 'single@email.com'  # string en vez de lista
        }
        errors = validate_notification_data(data)
        assert len(errors) > 0
        
        
class TestSendFunctions:
    """Tests para funciones de envío simulado - TDD Fase RED"""
    
    def test_send_email_returns_true(self):
        """send_email debe retornar True al simular envío exitoso"""
        from src.app import send_email
        result = send_email(['user@test.com'], 'Test message')
        assert result is True
    
    def test_send_email_with_multiple_recipients(self):
        """send_email debe manejar múltiples destinatarios"""
        from src.app import send_email
        recipients = ['user1@test.com', 'user2@test.com', 'user3@test.com']
        result = send_email(recipients, 'Hello everyone')
        assert result is True
    
    def test_send_email_prints_info(self, capsys):
        """send_email debe imprimir información del envío"""
        from src.app import send_email
        send_email(['user1@test.com', 'user2@test.com'], 'Hello')
        
        captured = capsys.readouterr()
        assert 'EMAIL' in captured.out
        assert '2' in captured.out  # número de destinatarios
    
    def test_send_sms_returns_true(self):
        """send_sms debe retornar True al simular envío exitoso"""
        from src.app import send_sms
        result = send_sms(['+56912345678'], 'Test SMS')
        assert result is True
    
    def test_send_sms_with_multiple_numbers(self):
        """send_sms debe manejar múltiples números"""
        from src.app import send_sms
        numbers = ['+56912345678', '+56987654321', '+56911111111']
        result = send_sms(numbers, 'SMS test')
        assert result is True
    
    def test_send_sms_prints_info(self, capsys):
        """send_sms debe imprimir información del envío"""
        from src.app import send_sms
        send_sms(['+56987654321'], 'SMS message')
        
        captured = capsys.readouterr()
        assert 'SMS' in captured.out
        
        
class TestSendEndpoint:
    """Tests para endpoint POST /api/notifications/send - TDD Fase RED"""
    
    @patch('src.app.requests.post')
    @patch('src.app.send_email')
    def test_send_email_notification_success(self, mock_send_email, mock_post, 
                                            client, valid_email_notification):
        """Debe enviar notificación EMAIL y guardar en BD"""
        # Mock del envío
        mock_send_email.return_value = True
        
        # Mock de la respuesta del servicio de BD
        mock_post.return_value = Mock(
            status_code=201,
            json=lambda: {
                'id': 'notif-123-uuid',
                'type': 'EMAIL',
                'message': 'Bienvenido al evento',
                'recipients': ['user1@example.com', 'user2@example.com'],
                'sentAt': '2024-11-15T10:30:00Z',
                'createdAt': '2024-11-15T10:30:00Z',
                'updatedAt': '2024-11-15T10:30:00Z'
            }
        )
        
        response = client.post(
            '/api/notifications/send',
            data=json.dumps(valid_email_notification),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['status'] == 'sent'
        assert 'notification_id' in data
        assert data['sent_count'] == 2
        
        # Verificar que se llamó a send_email
        mock_send_email.assert_called_once_with(
            valid_email_notification['recipients'],
            valid_email_notification['message']
        )
        
        # Verificar que se llamó al servicio de BD
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[0][0] == 'http://localhost:3000/notifications'
    
    @patch('src.app.requests.post')
    @patch('src.app.send_sms')
    def test_send_sms_notification_success(self, mock_send_sms, mock_post, 
                                          client, valid_sms_notification):
        """Debe enviar notificación SMS y guardar en BD"""
        mock_send_sms.return_value = True
        mock_post.return_value = Mock(
            status_code=201,
            json=lambda: {
                'id': 'notif-456-uuid',
                'type': 'SMS',
                'message': 'Tu entrada ha sido confirmada',
                'recipients': ['+56912345678', '+56987654321'],
                'sentAt': '2024-11-15T10:30:00Z',
                'createdAt': '2024-11-15T10:30:00Z',
                'updatedAt': '2024-11-15T10:30:00Z'
            }
        )
        
        response = client.post(
            '/api/notifications/send',
            data=json.dumps(valid_sms_notification),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['status'] == 'sent'
        assert data['sent_count'] == 2
        mock_send_sms.assert_called_once()
    
    def test_send_notification_invalid_data(self, client):
        """Debe rechazar datos inválidos con 400"""
        invalid_data = {
            'type': 'TELEGRAM',  # tipo inválido
            'message': 'Test'
            # falta recipients
        }
        
        response = client.post(
            '/api/notifications/send',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'errors' in data
        assert len(data['errors']) > 0
    
    def test_send_notification_missing_type(self, client):
        """Debe rechazar request sin type"""
        invalid_data = {
            'message': 'Test',
            'recipients': ['user@test.com']
        }
        
        response = client.post(
            '/api/notifications/send',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        assert response.status_code == 400
    
    @patch('src.app.requests.post')
    @patch('src.app.send_email')
    def test_send_notification_database_error(self, mock_send_email, mock_post, 
                                             client, valid_email_notification):
        """Debe manejar error al guardar en BD con 500"""
        mock_send_email.return_value = True
        
        # Simular error del servicio de BD
        mock_post.return_value = Mock(
            status_code=500,
            json=lambda: {'error': 'Database error'}
        )
        
        response = client.post(
            '/api/notifications/send',
            data=json.dumps(valid_email_notification),
            content_type='application/json'
        )
        
        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data
    
    @patch('src.app.requests.post')
    @patch('src.app.send_email')
    def test_send_notification_database_unavailable(self, mock_send_email, mock_post, 
                                                    client, valid_email_notification):
        """Debe manejar cuando el servicio de BD no está disponible"""
        mock_send_email.return_value = True
        
        # Simular que el servicio de BD no responde
        mock_post.side_effect = Exception('Connection refused')
        
        response = client.post(
            '/api/notifications/send',
            data=json.dumps(valid_email_notification),
            content_type='application/json'
        )
        
        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data
        assert 'unavailable' in data['error'].lower() or 'connection' in data['error'].lower()
        
class TestHistoryEndpoint:
    """Tests para endpoint GET /api/notifications/history - TDD Fase RED"""
    
    @patch('src.app.requests.get')
    def test_get_history_success(self, mock_get, client):
        """Debe obtener historial de notificaciones desde BD"""
        mock_get.return_value = Mock(
            status_code=200,
            json=lambda: [
                {
                    'id': 'notif-1',
                    'type': 'EMAIL',
                    'message': 'Welcome',
                    'recipients': ['user1@test.com'],
                    'sentAt': '2024-11-15T10:00:00Z',
                    'createdAt': '2024-11-15T10:00:00Z',
                    'updatedAt': '2024-11-15T10:00:00Z'
                },
                {
                    'id': 'notif-2',
                    'type': 'SMS',
                    'message': 'Reminder',
                    'recipients': ['+56912345678'],
                    'sentAt': '2024-11-15T11:00:00Z',
                    'createdAt': '2024-11-15T11:00:00Z',
                    'updatedAt': '2024-11-15T11:00:00Z'
                }
            ]
        )
        
        response = client.get('/api/notifications/history')
        
        assert response.status_code == 200
        data = response.get_json()
        assert 'notifications' in data
        assert len(data['notifications']) == 2
        
        # Verificar que se llamó al servicio de BD
        mock_get.assert_called_once_with(
            'http://localhost:3000/notifications',
            timeout=5
        )
    
    @patch('src.app.requests.get')
    def test_get_history_empty(self, mock_get, client):
        """Debe manejar historial vacío"""
        mock_get.return_value = Mock(
            status_code=200,
            json=lambda: []
        )
        
        response = client.get('/api/notifications/history')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data['notifications'] == []
    
    @patch('src.app.requests.get')
    def test_get_history_database_error(self, mock_get, client):
        """Debe manejar error del servicio de BD"""
        mock_get.return_value = Mock(
            status_code=500,
            json=lambda: {'error': 'Internal server error'}
        )
        
        response = client.get('/api/notifications/history')
        
        assert response.status_code == 500
    
    @patch('src.app.requests.get')
    def test_get_history_database_unavailable(self, mock_get, client):
        """Debe manejar cuando BD no está disponible"""
        mock_get.side_effect = Exception('Connection timeout')
        
        response = client.get('/api/notifications/history')
        
        assert response.status_code == 500
        data = response.get_json()
        assert 'error' in data