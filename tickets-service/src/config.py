import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DATABASE_SERVICE_URL = os.getenv(
        'DATABASE_SERVICE_URL', 'http://localhost:3000')
    PORT = int(os.getenv('PORT', 5002))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
