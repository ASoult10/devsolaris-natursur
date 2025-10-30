from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# === CONFIGURACIÓN ===
#Pegar en navegador: https://api.telegram.org/8284120713:AAH1gMBxbnk-8NKq3kBMxUY-pnoDaYM93LU/getUpdates
TOKEN = "8284120713:AAH1gMBxbnk-8NKq3kBMxUY-pnoDaYM93LU" 
ADMIN_CHAT_ID = 8370275487 #cntacto que recibirá los resultados

# === ESTRUCTURA DE ENCUESTA ===
ENCUESTA = [
    "¿Cuál es tu nombre?",
    "¿Qué edad tienes?",
    "¿Cuál es tu comida favorita?",
    "¿Cómo calificarías este bot del 1 al 5?"
]

# Diccionario temporal para almacenar respuestas
respuestas_usuarios = {}

# === FUNCIONES ===
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_chat.id
    respuestas_usuarios[user_id] = {"indice": 0, "respuestas": []}
    await update.message.reply_text(f"¡Hola! Vamos a comenzar la encuesta. Tu admin id es {user_id}")
    await update.message.reply_text(ENCUESTA[0])

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
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, recibir_respuesta))
    print("🤖 Bot en marcha...")
    app.run_polling()

if __name__ == "__main__":
    main()
