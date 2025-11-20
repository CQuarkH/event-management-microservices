# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY src/ ./src/

# Expose port 5002
EXPOSE 5002

# Set environment variables
ENV PYTHONPATH=/app
ENV FLASK_APP=src.app

# Run the application
CMD ["python", "-m", "src.app"]