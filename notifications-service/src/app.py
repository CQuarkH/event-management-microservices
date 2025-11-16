from flask import Flask
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

if __name__ == '__main__':
    app.run(
        debug=app.config['DEBUG'], 
        port=app.config['NOTIFICATIONS_PORT'],
        host='0.0.0.0'
    )