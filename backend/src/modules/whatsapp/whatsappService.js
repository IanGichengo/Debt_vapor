const axios = require('axios');

class WhatsAppService {
  constructor() {
    const version = process.env.WHATSAPP_VERSION || 'v22.0';
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    this.baseUrl = `https://graph.facebook.com/${version}/${phoneId}`;
    this.token = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  /**
   * Universal Template Sender
   * @param {string} recipientPhone - 2547XXXXXXXX
   * @param {string} templateName - e.g., "account_balance_service"
   * @param {string} languageCode - e.g., "en"
   * @param {Array} components - The dynamic parameters [{{1}}, {{2}}, {{3}}]
   */
  async sendTemplate(recipientPhone, templateName, languageCode, components) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: "whatsapp",
          to: recipientPhone,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode || "en" },
            components: components // These are the parameters passed from Controller
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      // Log the full Meta error to your terminal for debugging
      console.error('WhatsApp API Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
      throw error;
    }
  }

  /**
   * Regular Message Sender (For Gemini/AI replies)
   */
  async sendMessage(recipientPhone, text) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientPhone,
          type: "text",
          text: { body: text }
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp Send Message Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new WhatsAppService();
