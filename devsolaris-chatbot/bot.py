from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup, InputMediaPhoto
)
from telegram.ext import (
    ApplicationBuilder, CommandHandler, MessageHandler,
    CallbackQueryHandler, ContextTypes, filters
)
# === CONFIGURACIÓN ===
#Pegar en navegador: https://api.telegram.org/8284120713:AAH1gMBxbnk-8NKq3kBMxUY-pnoDaYM93LU/getUpdates
TOKEN = "8284120713:AAH1gMBxbnk-8NKq3kBMxUY-pnoDaYM93LU" 
ADMIN_CHAT_ID = 8370275487 #cntacto que recibirá los resultados

usuarios_en_solicitud = {}

# === DATOS ===
ENCUESTA = [
    "¿Cuál es tu nombre?",
    "¿Qué edad tienes?",
    "¿Cuál es tu comida favorita?",
    "¿Cómo calificarías este bot del 1 al 5?"
]

PRODUCTOS = [
    {
        "id": "f1",
        "nombre": "Fórmula 1 Alimento Equilibrado",
        "descripcion": "Sustituto de comida con proteínas, vitaminas y minerales.",
        "imagen": "https://natursur.herbalife.com/dmassets/regional-reusable-assets/emea/images/product-canister/pc-4468-es.png:pdp-w875h783?fmt=webp-alpha"
    },
    {
        "id": "te_termogénico",
        "nombre": "Té Termogénico Herbal",
        "descripcion": "Bebida instantánea con extracto de té verde y negro.",
        "imagen": "https://natursur.herbalife.com/dmassets/regional-reusable-assets/emea/images/product-canister/pc-048k-es.png:pdp-w875h783?fmt=webp-alpha"
    }
]

# Diccionario temporal para almacenar respuestas
respuestas_usuarios = {}

# === FUNCIONES ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "👋 ¡Hola! Puedes usar los siguientes comandos:\n"
        "📋 /encuesta - Responder una breve encuesta\n"
        "🛍️ /productos - Ver nuestro catálogo Herbalife"
    )


async def productos(update: Update, context: ContextTypes.DEFAULT_TYPE):
    for producto in PRODUCTOS:
        botones = [
            [InlineKeyboardButton("🛒 Solicitar", callback_data=f"solicitar_{producto['id']}")]
        ]
        reply_markup = InlineKeyboardMarkup(botones)
        await update.message.reply_photo(
            photo=producto["imagen"],
            caption=f"**{producto['nombre']}**\n{producto['descripcion']}",
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
        usuarios_en_solicitud[user_id] = producto
        await query.message.reply_text(
            f"📦 Has elegido *{producto['nombre']}*\n"
            f"Por favor, indica la cantidad que deseas pedir:",
            parse_mode="Markdown"
        )

async def recibir_cantidad(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_chat.id

    if user_id not in usuarios_en_solicitud:
        return  # No está en modo solicitud

    producto = usuarios_en_solicitud[user_id]
    texto = update.message.text.strip()

    # Validar que sea un número
    if not texto.isdigit():
        await update.message.reply_text("⚠️ Por favor, escribe un número válido (ejemplo: 2).")
        return

    cantidad = int(texto)

    # Crear mensaje para el admin
    user = update.message.from_user
    mensaje_admin = (
        f"📦 *Nueva solicitud de producto*\n\n"
        f"👤 Usuario: {user.full_name}\n"
        f"🆔 ID: {user.id}\n"
        f"📱 Usuario Telegram: @{user.username or 'no tiene'}\n\n"
        f"🛍️ Producto: *{producto['nombre']}*\n"
        f"📊 Cantidad: *{cantidad}*\n"
        f"{producto['descripcion']}"
    )

    # Enviar al admin
    await context.bot.send_photo(
        chat_id=ADMIN_CHAT_ID,
        photo=producto["imagen"],
        caption=mensaje_admin,
        parse_mode="Markdown"
    )

    # Confirmar al usuario
    await update.message.reply_text(
        f"✅ Has solicitado *{cantidad}* unidad(es) de *{producto['nombre']}*.\n"
        f"El administrador se pondrá en contacto contigo pronto.",
        parse_mode="Markdown"
    )

    # Limpiar estado
    del usuarios_en_solicitud[user_id]


async def recibir_respuesta(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_chat.id
    if user_id not in respuestas_usuarios:
        await update.message.reply_text("Por favor, usa /start para comenzar la encuesta.")
        return

    data = respuestas_usuarios[user_id]
    data["respuestas"].append(update.message.text)
    data["indice"] += 1

    if data["indice"] < len(ENCUESTA):
        await update.message.reply_text(ENCUESTA[data["indice"]])
    else:
        # Encuesta terminada
        resumen = "\n".join(
            f"{ENCUESTA[i]}: {data['respuestas'][i]}" for i in range(len(ENCUESTA))
        )
        await update.message.reply_text("¡Gracias por tus respuestas! ✅")

        # Enviar los resultados al administrador
        await context.bot.send_message(
            chat_id=ADMIN_CHAT_ID,
            text=f"📋 *Nuevo formulario completado:*\n\n{resumen}",
            parse_mode="Markdown"
        )

        # Limpiar los datos
        del respuestas_usuarios[user_id]

# === MAIN ===
def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("productos", productos))
    app.add_handler(CallbackQueryHandler(solicitar_producto, pattern="^solicitar_"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_cantidad))

    #app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_respuesta))
    print("🤖 Bot en marcha...")
    app.run_polling()

if __name__ == "__main__":
    main()
