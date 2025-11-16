import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask config
    DEBUG = os.getenv('DEBUG', 'True') == 'True'
    TESTING = False
    
    # Service ports
    NOTIFICATIONS_PORT = int(os.getenv('NOTIFICATIONS_PORT', 5003))
    DATABASE_SERVICE_URL = os.getenv('DATABASE_SERVICE_URL', 'http://localhost:5000')
    
class TestConfig(Config):
    TESTING = True
    DATABASE_SERVICE_URL = 'http://localhost:5000'  # Para mocks