from flask import Flask
from src.config import Config

app = Flask(__name__)
app.config.from_object(Config)

# =================== FUNCIÓN DE VALIDACIÓN ===================

def validate_notification_data(data):
    """
    Valida los datos de una notificación según el formato del servicio de BD
    
    Args:
        data: dict con type, message, recipients
    
    Returns:
        lista de errores (vacía si es válido)
    """
    errors = []
    
    # Validar type
    if 'type' not in data:
        errors.append('Field "type" is required')
    elif data['type'] not in ['EMAIL', 'SMS']:
        errors.append('Field "type" must be "EMAIL" or "SMS" (uppercase)')
    
    # Validar message
    if 'message' not in data:
        errors.append('Field "message" is required')
    elif not isinstance(data['message'], str) or not data['message'].strip():
        errors.append('Field "message" cannot be empty')
    
    # Validar recipients
    if 'recipients' not in data:
        errors.append('Field "recipients" is required')
    elif not isinstance(data['recipients'], list):
        errors.append('Field "recipients" must be a list')
    elif len(data['recipients']) == 0:
        errors.append('Field "recipients" must be a non-empty list')
    
    return errors


if __name__ == '__main__':
    app.run(
        debug=app.config['DEBUG'], 
        port=app.config['NOTIFICATIONS_PORT'],
        host='0.0.0.0'
    )