import json
import pyodbc

# 1 — Load JSON from file
with open("devsolaris-natursur/devsolaris-chatbot/productos_scrapeados.json", "r", encoding="utf-8") as f:
    productos = json.load(f)

# 2 — Azure SQL connection
#CUANDO OS VAYAIS A CONECTAR DECIDME PARA AÑADIR VUESTRA IP DE VUESTRO ORDENADOR EN LA LISTA BLANCA DE AZURE
conn = pyodbc.connect(
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=tcp:natursur-products.database.windows.net,1433;"
    "Database=Productos;"
    "Uid=NatursurAdmin;"
    "Pwd=Productos!;"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
    "Connection Timeout=30;"
)

cursor = conn.cursor()

# 3 — Insert items
for p in productos:
    cursor.execute("""
        IF NOT EXISTS (SELECT 1 FROM Productos WHERE id = ?)
        INSERT INTO Productos (id, nombre, descripcion, imagen, precio)
        VALUES (?, ?, ?, ?, ?)
    """,
    p["id"], p["id"], p["nombre"], p["descripcion"], p["imagen"], p["precio"])


conn.commit()
cursor.close()
conn.close()

print("Productos insertados en Azure SQL correctamente.")
