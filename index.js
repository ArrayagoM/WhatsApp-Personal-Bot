const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const dotenv = require("dotenv");
const fetch = require("node-fetch"); // Usamos fetch para verificar DeepSeek

dotenv.config();

if (!process.env.DEEPSEEK_API_KEY) {
  console.error("❌ ERROR: No se encontró la API Key de DeepSeek en el .env");
  process.exit(1);
}

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("ready", () => {
  console.log("✅ Bot de WhatsApp está listo para responder mensajes");
});

client.on("message", async (msg) => {
  console.log(`📩 Mensaje recibido de ${msg.from}: ${msg.body}`);

  await client.sendMessage(
    msg.from,
    "🤖 Estoy buscando la mejor respuesta para ti..."
  );

  try {
    // Enviamos la solicitud con fetch en lugar de OpenAI para ver qué devuelve
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: msg.body }],
        temperature: 0.7,
      }),
    });

    // Intentamos obtener el JSON de la respuesta
    const data = await response.json();
    console.log("📡 Respuesta RAW de DeepSeek:", JSON.stringify(data, null, 2));

    if (!data || !data.choices || data.choices.length === 0) {
      throw new Error("DeepSeek devolvió una respuesta vacía.");
    }

    const respuesta =
      data.choices[0].message?.content || "No pude generar una respuesta.";
    console.log(`🤖 Respuesta generada: ${respuesta}`);

    await client.sendMessage(msg.from, respuesta);
  } catch (error) {
    console.error("❌ Error al obtener respuesta de DeepSeek:", error.message);

    let mensajeError = "⚠️ Ocurrió un problema. Inténtalo más tarde.";
    if (error.message.includes("Unexpected end of JSON")) {
      mensajeError =
        "⚠️ DeepSeek no respondió correctamente. Inténtalo más tarde.";
    } else if (error.message.includes("timeout")) {
      mensajeError = "⏳ DeepSeek tardó demasiado en responder.";
    }

    await client.sendMessage(msg.from, mensajeError);
  }
});

const app = express();
app.get("/", (req, res) =>
  res.send("✅ El bot está funcionando correctamente.")
);
app.listen(3000, () =>
  console.log("🚀 Servidor Express en http://localhost:3000")
);

client.initialize();
