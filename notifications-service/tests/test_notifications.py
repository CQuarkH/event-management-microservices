import pytest
from src.app import validate_notification_data

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