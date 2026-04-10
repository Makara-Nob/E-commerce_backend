import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

/**
 * Send a message to the specified Telegram chat using the bot API.
 * @param message The text message to send. Supports basic Markdown/HTML if configured.
 */
export const sendTelegramMessage = async (message: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID_HERE") {
    console.warn("[Telegram] Notification skipped: Bot token or Chat ID not configured correctly.");
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "Markdown", // Allows simple formatting like *bold* and _italic_
    });

    if (response.data && response.data.ok) {
      console.log("[Telegram] Message sent successfully.");
    } else {
      console.error("[Telegram] API returned an error:", response.data);
    }
  } catch (error: any) {
    console.error("[Telegram] Error sending message:", error.response?.data || error.message);
  }
};
