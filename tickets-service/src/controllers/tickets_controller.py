from flask import Blueprint, request, jsonify
from src.services.tickets_service import TicketsService

tickets_bp = Blueprint('tickets', __name__)
tickets_service = TicketsService()


@tickets_bp.route('/availability/<ticket_id>', methods=['GET'])
def check_availability(ticket_id):
    """Verificar disponibilidad de una entrada específica"""
    try:
        # Validar formato de ticket_id
        if not ticket_id or not isinstance(ticket_id, str):
            return jsonify({"error": "ID de entrada inválido"}), 400

        available = tickets_service.check_availability(ticket_id)
        if available is None:
            return jsonify({"error": "Entrada no encontrada"}), 404

        return jsonify({
            "ticket_id": ticket_id,
            "available_quantity": available,
            "available": available > 0
        })
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@tickets_bp.route('/purchase', methods=['POST'])
def purchase_tickets():
    """Procesar compra de entradas"""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser application/json"}), 400

        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos JSON requeridos"}), 400

        ticket_id = data.get('ticket_id')
        quantity = data.get('quantity')

        if not ticket_id:
            return jsonify({"error": "ticket_id es requerido"}), 400

        if not isinstance(ticket_id, str):
            return jsonify({"error": "ticket_id debe ser una cadena"}), 400

        if not quantity:
            return jsonify({"error": "quantity es requerido"}), 400

        if not isinstance(quantity, int):
            return jsonify({"error": "quantity debe ser un número entero"}), 400

        if quantity <= 0:
            return jsonify({"error": "La cantidad debe ser mayor a 0"}), 400

        if quantity > 100:  # Límite máximo por compra
            return jsonify({"error": "No se pueden comprar más de 100 entradas por transacción"}), 400

        result = tickets_service.purchase_tickets(ticket_id, quantity)
        return jsonify({
            "success": True,
            "purchase": result
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@tickets_bp.route('/', methods=['GET'])
def get_all_tickets():
    """Obtener todas las entradas disponibles"""
    try:
        tickets = tickets_service.get_all_tickets()
        if tickets is None:
            return jsonify({"error": "No se pudieron obtener las entradas"}), 500

        return jsonify(tickets)
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@tickets_bp.route('/<ticket_id>', methods=['GET'])
def get_ticket_info(ticket_id):
    """Obtener información de una entrada específica"""
    try:
        if not ticket_id or not isinstance(ticket_id, str):
            return jsonify({"error": "ID de entrada inválido"}), 400

        ticket_info = tickets_service.get_ticket_info(ticket_id)
        if not ticket_info:
            return jsonify({"error": "Entrada no encontrada"}), 404

        return jsonify(ticket_info)
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@tickets_bp.route('/<ticket_id>', methods=['PUT'])
def update_ticket(ticket_id):
    """Actualizar información de una entrada"""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type debe ser application/json"}), 400

        if not ticket_id or not isinstance(ticket_id, str):
            return jsonify({"error": "ID de entrada inválido"}), 400

        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos JSON requeridos"}), 400

        # Validar que no se envíe un diccionario vacío
        if not any(data.values()):
            return jsonify({"error": "Al menos un campo debe ser proporcionado para actualizar"}), 400

        result = tickets_service.update_ticket_info(ticket_id, data)
        if result is None:
            return jsonify({"error": "Entrada no encontrada"}), 404

        return jsonify(result)

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Error interno del servidor: {str(e)}"}), 500


@tickets_bp.route('/health', methods=['GET'])
def health_check():
    """Endpoint de verificación de salud del servicio"""
    return jsonify({
        "service": "tickets-service",
        "status": "healthy",
        "message": "Servicio de gestión de entradas funcionando correctamente"
    })
