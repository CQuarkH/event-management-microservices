from src.config import Config
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)


DB_SERVICE_URL = app.config['DATABASE_SERVICE_URL']

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

def send_email(recipients, message):
    """
    Simula envío de notificaciones por email
    
    Args:
        recipients: lista de emails
        message: mensaje a enviar
    
    Returns:
        True si el envío fue exitoso
    """
    print(f"📧 Sending EMAIL to {len(recipients)} recipients")
    print(f"   Message: {message}")
    for recipient in recipients:
        print(f"   → {recipient}")
    return True


def send_sms(recipients, message):
    """
    Simula envío de notificaciones por SMS
    
    Args:
        recipients: lista de números telefónicos
        message: mensaje a enviar
    
    Returns:
        True si el envío fue exitoso
    """
    print(f"📱 Sending SMS to {len(recipients)} recipients")
    print(f"   Message: {message}")
    for recipient in recipients:
        print(f"   → {recipient}")
    return True


# =================== ENDPOINTS ===================

@app.route('/api/notifications/send', methods=['POST'])
def send_notification():
    """
    Envía una notificación y la registra en el servicio de BD
    """
    data = request.get_json()
    
    # Validar datos
    errors = validate_notification_data(data)
    if errors:
        return jsonify({'errors': errors}), 400
    
    # Simular envío según tipo
    try:
        if data['type'] == 'EMAIL':
            send_email(data['recipients'], data['message'])
        else:  # SMS
            send_sms(data['recipients'], data['message'])
    except Exception as e:
        return jsonify({'error': f'Failed to send notification: {str(e)}'}), 500
    
    # Preparar datos para guardar en BD
    notification_record = {
        'type': data['type'],
        'message': data['message'],
        'recipients': data['recipients']
    }
    
    # Guardar en el servicio de BD
    try:
        response = requests.post(
            f"{DB_SERVICE_URL}/notifications",
            json=notification_record,
            timeout=5
        )
        
        if response.status_code not in [200, 201]:
            return jsonify({'error': 'Failed to save notification to database'}), 500
        
        created_notification = response.json()
        
    except Exception as e:
        # Captura TODAS las excepciones (RequestException, timeout, etc)
        return jsonify({'error': f'Database service unavailable: {str(e)}'}), 500
    
    return jsonify({
        'status': 'sent',
        'notification_id': created_notification['id'],
        'sent_count': len(data['recipients'])
    }), 201


if __name__ == '__main__':
    port = app.config['NOTIFICATIONS_PORT']
    print(f"🚀 Notifications Service running on http://localhost:{port}")
    print(f"📊 Database Service URL: {DB_SERVICE_URL}")
    app.run(debug=app.config['DEBUG'], port=port, host='0.0.0.0')