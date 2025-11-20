import sys
import time
import subprocess
import requests

# Configuración
MAX_RETRIES = 30
RETRY_INTERVAL = 2

# Lista de servicios a verificar
# Formato: (Nombre, URL)
# IMPORTANTE: Usar nombres de servicio de Docker, no localhost
SERVICES = [
    ("Database Service", "http://database-service:3000/api-docs-json"),
    ("Attendees Service", "http://attendees-service:5001/health"),
    ("Tickets Service", "http://tickets-service:5002/api/tickets/health"),
    ("Notifications Service", "http://notifications-service:5003/api/notifications/health")
]

def check_service(name, url):
    try:
        response = requests.get(url, timeout=2)
        # Consideramos éxito si el status code es 200-299
        if 200 <= response.status_code < 300:
            return True
        return False
    except requests.RequestException:
        # Error de conexión, timeout, DNS, etc.
        return False

def wait_for_services():
    print("⏳ Esperando a que los servicios estén disponibles...")
    
    for name, url in SERVICES:
        print(f"🔍 Verificando {name} en {url}...")
        retries = 0
        service_up = False
        
        while retries < MAX_RETRIES:
            if check_service(name, url):
                print(f"✅ {name} está disponible")
                service_up = True
                break
            
            retries += 1
            if retries % 5 == 0:
                print(f"   ... {name} aún no responde (intento {retries}/{MAX_RETRIES})")
            
            time.sleep(RETRY_INTERVAL)
            
        if not service_up:
            print(f"❌ {name} no respondió después de {MAX_RETRIES} intentos.")
            sys.exit(1)

    print("\n✅ Todos los servicios están listos")
    print("🧪 Iniciando pruebas de humo...\n")

def run_command():
    # Ejecuta el comando que se pasó como argumento al script (ej: pytest ...)
    if len(sys.argv) > 1:
        command = sys.argv[1:]
        try:
            # Ejecuta el comando y espera a que termine
            result = subprocess.run(command, check=False)
            # Sale con el mismo código de error que el comando ejecutado
            sys.exit(result.returncode)
        except Exception as e:
            print(f"❌ Error al ejecutar el comando de pruebas: {e}")
            sys.exit(1)
    else:
        print("⚠️ No se especificó ningún comando para ejecutar después de la espera.")

if __name__ == "__main__":
    wait_for_services()
    run_command()