const geminiConfig = require("../../config/gemini");
const logger = geminiConfig.getLogger();

class GeminiAgentService {
  constructor() {
    this.model = geminiConfig.getModel();
    this.rateLimit = geminiConfig.getRateLimitConfig();
  }

  async _callGemini(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      logger.error("Gemini API call failed", { error: error.message });
      throw error;
    }
  }

  _parseJSONResponse(text) {
    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);
    } catch (error) {
      logger.error("Failed to parse AI JSON", { text });
      return null;
    }
  }

  /**
   * Analysis with Conversational Intent
   */
  async analyzeDebtorMessage(message, debtorData, debtData) {
    const outstanding = debtData.amount - debtData.amountPaid;
    const prompt = `You are a professional Kenyan Debt Collection AI.
    Debtor: ${debtorData.name}. Outstanding: KES ${outstanding.toLocaleString()}.
    Message: "${message}"
    
    Task: Return JSON only.
    Fields: paymentIntent (full_payment, partial_payment, payment_plan_request, dispute, hardship, inquiry), 
    proposedAmount, proposedFrequency, emotionalTone, urgency, financialCapability, keyPoints (array), 
    recommendedAction, confidence, 
    responseMessage (A warm, 100-word Kenyan professional acknowledgment of their message).`;

    const response = await this._callGemini(prompt);
    return this._parseJSONResponse(response) || { paymentIntent: "inquiry", responseMessage: "Message received." };
  }

  /**
   * Payment Plan with Professional Kenyan Tone
   */
  async generatePaymentPlan(analysis, debtorData, debtData) {
    const outstanding = debtData.amount - debtData.amountPaid;
    const prompt = `Create a KES ${outstanding.toLocaleString()} payment plan for ${debtorData.name}.
    Tone: Professional, empathetic, Kenyan business style.
    Return JSON: totalAmount, installmentAmount, numberOfInstallments, frequency (weekly, monthly), 
    firstPaymentDate (YYYY-MM-DD), message (Friendly 200-word WhatsApp message with instructions),
    paymentInstructions (mpesa object with businessNumber 522533 and accountReference ${debtorData.id}).`;

    const response = await this._callGemini(prompt);
    return this._parseJSONResponse(response);
  }

  /**
   * Contextual Reminders
   */
  async generateReminderMessage(reminder, debtor, paymentPlan, daysUntilDue) {
    const amount = paymentPlan ? paymentPlan.installmentAmount : (debtor.debts[0].amount - debtor.debts[0].amountPaid);
    const prompt = `Generate a ${daysUntilDue < 0 ? 'FIRM OVERDUE' : 'FRIENDLY UPCOMING'} WhatsApp reminder for ${debtor.name}.
    Amount: KES ${amount.toLocaleString()}. Days: ${daysUntilDue}.
    Include M-Pesa Paybill 522533, Account ${debtor.id}. 
    Return PLAIN TEXT ONLY.`;

    return await this._callGemini(prompt);
  }
}

module.exports = new GeminiAgentService();
