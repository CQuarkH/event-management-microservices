from flask import Flask
from flask_cors import CORS
from src.config import Config
from src.controllers.tickets_controller import tickets_bp


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)
    CORS(app)
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=Config.PORT,
        debug=Config.DEBUG
    )
