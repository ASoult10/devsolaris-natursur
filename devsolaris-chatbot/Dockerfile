# Usamos Python oficial
FROM python:3.11-slim

# Actualizamos paquetes del sistema
RUN apt-get update && apt-get install -y \
    wget unzip curl gnupg \
    chromium chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Variables necesarias para Chrome en entorno server
ENV DISPLAY=:99
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROMEDRIVER=/usr/bin/chromedriver

# Crear carpeta del bot
WORKDIR /app

# Copiar el bot al contenedor
COPY . /app

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# El bot de Telegram arranca así:
CMD ["python", "bot.py"]