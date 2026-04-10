import dotenv from "dotenv";
dotenv.config();
import { sendTelegramMessage } from "./src/utils/telegramService";

async function testTelegram() {
    console.log("Testing Telegram notification...");
    console.log("Bot Token:", process.env.TELEGRAM_BOT_TOKEN ? "Set" : "Not Set");
    console.log("Chat ID:", process.env.TELEGRAM_CHAT_ID);

    const testMsg = "🚀 *Telegram Integration Test*\n\nIf you see this message, the bot is working correctly!";
    await sendTelegramMessage(testMsg);
    console.log("Test finished. Check your Telegram chat.");
}

testTelegram();
