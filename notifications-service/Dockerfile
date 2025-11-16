FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY src/ ./src/
COPY src/config.py .

# Exponer puerto
EXPOSE 5003

# Comando
CMD ["python", "-m", "src.app"]
