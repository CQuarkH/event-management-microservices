import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.app import app as flask_app

@pytest.fixture
def app():
    flask_app.config['TESTING'] = True
    yield flask_app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def valid_email_notification():
    """Notificación válida de tipo EMAIL"""
    return {
        'type': 'EMAIL',  # En mayúsculas como espera el servicio de BD
        'message': 'Bienvenido al evento',
        'recipients': ['user1@example.com', 'user2@example.com']
    }

@pytest.fixture
def valid_sms_notification():
    """Notificación válida de tipo SMS"""
    return {
        'type': 'SMS',
        'message': 'Tu entrada ha sido confirmada',
        'recipients': ['+56912345678', '+56987654321']
    }