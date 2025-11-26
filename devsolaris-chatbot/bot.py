import json
import os
from datetime import datetime
from pathlib import Path
import requests
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup
)
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters
)

# === CONFIGURACIÓN ===
TOKEN = "8284120713:AAH1gMBxbnk-8NKq3kBMxUY-pnoDaYM93LU" 
ADMIN_CHAT_ID = 8370275487
BACKEND_API_URL = "http://localhost:8080/api/orders"  # or your deployed backend
TOKEN_ADMIN = "I-AM-BOT"

carritos = {}  # <--- CART FOR MULTIPLE ITEMS

# === Paths (relative to this script) ===
BASE_DIR = Path(__file__).resolve().parent

# === LOAD PRODUCTS ===
PRODUCTOS_PATH = BASE_DIR / 'productos_scrapeados.json'
with open(PRODUCTOS_PATH, encoding="utf-8") as f:
    PRODUCTOS = json.load(f)

ORDERS_FILE = BASE_DIR / 'orders.json'

# === Ensure orders.json exists ===
if not ORDERS_FILE.exists():
    ORDERS_FILE.write_text(json.dumps([], ensure_ascii=False, indent=4), encoding="utf-8")


def guardar_orden(data):
    with open(ORDERS_FILE, "r", encoding="utf-8") as f:
        orders = json.load(f)
    orders.append(data)
    with open(ORDERS_FILE, "w", encoding="utf-8") as f:
        json.dump(orders, f, indent=4, ensure_ascii=False)


# === FUNCTIONS ===

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 ¡Bienvenido! Usa:\n"
        "🛍️ /productos - Ver catálogo Herbalife\n"
        "🧾 /carrito - Ver pedido actual"
    )


async def productos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    for producto in PRODUCTOS:
        botones = [
            [InlineKeyboardButton("🛒 Solicitar", callback_data=f"solicitar_{producto['id']}")]
        ]
        reply_markup = InlineKeyboardMarkup(botones)
        await update.message.reply_photo(
            photo=producto["imagen"],
            caption=f"**{producto['nombre']}**\n{producto['descripcion']}\n\n"
                    f"💲 Precio: {producto['precio']}",
            reply_markup=reply_markup,
            parse_mode="Markdown"
        )


async def solicitar_producto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    producto_id = query.data.replace("solicitar_", "")
    producto = next((p for p in PRODUCTOS if p["id"] == producto_id), None)
    user_id = query.from_user.id

    if producto:
        context.user_data["producto_seleccionado"] = producto
        await query.message.reply_text(
            f"📦 Has elegido *{producto['nombre']}*\n"
            "👉 ¿Cuántas unidades deseas?",
            parse_mode="Markdown"
        )


async def recibir_cantidad(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_chat.id

    if "producto_seleccionado" not in context.user_data:
        return

    producto = context.user_data["producto_seleccionado"]
    cantidad_txt = update.message.text.strip()

    if not cantidad_txt.isdigit():
        await update.message.reply_text("⚠️ Escribe un número válido.")
        return

    cantidad = int(cantidad_txt)

    # === Add to cart ===
    if user_id not in carritos:
        carritos[user_id] = {"items": []}

    carritos[user_id]["items"].append({
        "producto": producto,
        "cantidad": cantidad
    })

    # Clear temp selection
    del context.user_data["producto_seleccionado"]

    await mostrar_menu_pedido(update, context, user_id)


async def mostrar_menu_pedido(update, context, user_id):
    botones = [
        [InlineKeyboardButton("🛒 Añadir otro producto", callback_data="add_more")],
        [InlineKeyboardButton("✅ Confirmar pedido", callback_data="confirm_order")],
        [InlineKeyboardButton("❌ Cancelar pedido", callback_data="cancel_order")]
    ]
    reply_markup = InlineKeyboardMarkup(botones)

    # Build summary
    texto = "🧾 *Tu pedido actual:*\n\n"
    for item in carritos[user_id]["items"]:
        texto += f"- {item['producto']['nombre']} x {item['cantidad']}\n"

    await update.message.reply_text(
        texto,
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def manejar_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    user_id = query.from_user.id
    await query.answer()

    if query.data == "add_more":
        await query.message.reply_text("🛍️ Usa /productos para elegir otro artículo.")
    elif query.data == "confirm_order":
        await confirmar_pedido(query, context, user_id)
    elif query.data == "cancel_order":
        await cancelar_pedido(query, user_id)


async def confirmar_pedido(query, context, user_id):
    carrito = carritos.get(user_id)

    if not carrito or not carrito["items"]:
        await query.message.reply_text("❗ No tienes productos en el pedido.")
        return

    user = query.from_user

    # Build order JSON for backend
    import json

    from datetime import datetime

    backend_order = {
        "userId": user.id,
        "username": user.username or "",
        "fullName": user.full_name,
        "items": json.dumps([
            {
                "product": item["producto"]["nombre"],
                "productId": item["producto"]["id"],
                "cantidad": item["cantidad"]
            } for item in carrito["items"]
        ]),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # <-- Add this
    }



    # Set headers with your token
    headers = {
        "Authorization": f"Bearer {TOKEN_ADMIN}",  # <- Use your token here
        "Content-Type": "application/json"
    }

    # Send order to backend
    try:
        response = requests.post(BACKEND_API_URL, json=backend_order, headers=headers)
        response.raise_for_status()
    except requests.RequestException as e:
        await query.message.reply_text(f"❌ Error enviando el pedido al servidor: {e}")
        return

    # Notify admin in Telegram
    resumen = "🆕 *Nuevo pedido múltiple:*\n\n"
    resumen += f"👤 {user.full_name} (@{user.username})\n\n"
    for item in carrito["items"]:
        resumen += f"- {item['producto']['nombre']} x {item['cantidad']}\n"

    await context.bot.send_message(
        chat_id=ADMIN_CHAT_ID,
        text=resumen,
        parse_mode="Markdown"
    )

    await query.message.reply_text("✅ Tu pedido ha sido enviado correctamente.")

    # Clear cart
    del carritos[user_id]



async def cancelar_pedido(query, user_id):
    if user_id in carritos:
        del carritos[user_id]
    await query.message.reply_text("❌ Pedido cancelado.")


# === MAIN ===
def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("productos", productos))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_cantidad))
    app.add_handler(CallbackQueryHandler(solicitar_producto, pattern="^solicitar_"))
    app.add_handler(CallbackQueryHandler(manejar_menu, pattern="^(add_more|confirm_order|cancel_order)$"))

    print("🤖 Bot en marcha...")
    app.run_polling()


if __name__ == "__main__":
    main()