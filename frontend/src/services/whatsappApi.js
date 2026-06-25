import api from './api';

/**
 * WhatsApp API service with specialized handling for 24-hour rules 
 * and AI-to-Template mapping.
 */
const whatsappApi = {
  /**
   * Send AI-Personalized Template Reminder to Debtor
   * DEFAULT METHOD: Bypasses 24-hour rule using WhatsApp templates
   * The backend auto-generates template parameters from debtor data
   * 
   * @param {string} debtorId - The debtor's ID
   * @param {object} options - Optional configuration
   * @param {boolean} options.useTemplate - Use template (default: true)
   * @param {string} options.templateName - Template name (default: "payment_reminder")
   * @returns {Promise} Response data
   */
  sendAIReminderToDebtor: async (debtorId, options = {}) => {
    try {
      const { 
        useTemplate = true, 
        templateName = "overdue_direct_action" 
      } = options;

      // ✅ FIXED: Correct syntax with parentheses
      const response = await api.post(`/whatsapp/send-to-debtor/${debtorId}`, {
        useTemplate,
        templateName
      });
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || error.message;
      
      // Handle WhatsApp API token/auth errors
      if (error.response?.status === 401) {
        const whatsappError = new Error(
          errorMessage || 'WhatsApp API token expired or invalid. Please update configuration in settings.'
        );
        whatsappError.isWhatsAppError = true;
        whatsappError.statusCode = 401;
        throw whatsappError;
      }
      
      // Handle template-related errors
      if (error.response?.status === 400) {
        if (errorMessage?.toLowerCase().includes('template')) {
          const templateError = new Error(
            `Template error: The '${templateName}' template is not approved or parameters don't match. Please check Meta Business Manager.`
          );
          templateError.isTemplateError = true;
          templateError.statusCode = 400;
          throw templateError;
        }
        
        if (errorMessage?.toLowerCase().includes('phone')) {
          const phoneError = new Error(
            errorMessage || 'Debtor has no phone number on file.'
          );
          phoneError.isPhoneError = true;
          phoneError.statusCode = 400;
          throw phoneError;
        }
        
        if (errorMessage?.toLowerCase().includes('debt')) {
          const debtError = new Error(
            errorMessage || 'No active debts found for this debtor.'
          );
          debtError.isDebtError = true;
          debtError.statusCode = 400;
          throw debtError;
        }
      }
      
      // Handle debtor not found
      if (error.response?.status === 404) {
        const notFoundError = new Error(
          errorMessage || 'Debtor not found.'
        );
        notFoundError.isNotFoundError = true;
        notFoundError.statusCode = 404;
        throw notFoundError;
      }
      
      // Generic error
      const genericError = new Error(
        errorMessage || 'Failed to send WhatsApp reminder.'
      );
      genericError.statusCode = error.response?.status;
      throw genericError;
    }
  },

  /**
   * Send Free-form WhatsApp message (AI-generated)
   * ⚠️ ONLY WORKS within 24-hour window after customer's last message
   * Use sendAIReminderToDebtor with templates for cold outreach
   * 
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} message - Message text
   * @param {object} options - Optional configuration
   * @returns {Promise} Response data
   */
  sendMessage: async (phoneNumber, message, options = {}) => {
    try {
      const response = await api.post('/whatsapp/send', {
        to: phoneNumber,
        message,
        previewUrl: options.previewUrl || false,
      });
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || error.message;
      
      // Handle 24-hour window errors
      if (error.response?.status === 400 || error.response?.status === 403) {
        // WhatsApp error code 131047 = 24-hour window closed
        if (errorMessage?.includes('24') || 
            errorMessage?.includes('131047') ||
            errorMessage?.includes('window')) {
          
          const windowError = new Error(
            '❌ 24-hour messaging window has closed. You must use a Template message to contact this customer. Use sendAIReminderToDebtor() instead.'
          );
          windowError.is24HourWindowError = true;
          windowError.statusCode = 400;
          throw windowError;
        }
      }
      
      // Handle auth errors
      if (error.response?.status === 401) {
        const authError = new Error(
          errorMessage || 'WhatsApp API authentication failed. Check your access token.'
        );
        authError.isWhatsAppError = true;
        authError.statusCode = 401;
        throw authError;
      }
      
      // Generic error
      const genericError = new Error(
        errorMessage || 'Failed to send WhatsApp message.'
      );
      genericError.statusCode = error.response?.status;
      throw genericError;
    }
  },

  /**
   * Send standard WhatsApp template message (Manual)
   * Use this for custom template implementations
   * 
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} templateName - Approved template name from Meta
   * @param {string} languageCode - Language code (default: "en")
   * @param {array} components - Template components with parameters
   * @returns {Promise} Response data
   */
  sendTemplate: async (phoneNumber, templateName, languageCode = "en", components = []) => {
    try {
      const response = await api.post('/whatsapp/send-template', {
        to: phoneNumber,
        templateName,
        languageCode,
        components
      });
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || error.message;
      
      // Handle template errors
      if (error.response?.status === 400) {
        const templateError = new Error(
          errorMessage || `Template '${templateName}' not found or invalid parameters.`
        );
        templateError.isTemplateError = true;
        templateError.statusCode = 400;
        throw templateError;
      }
      
      // Handle auth errors
      if (error.response?.status === 401) {
        const authError = new Error(
          errorMessage || 'WhatsApp API authentication failed.'
        );
        authError.isWhatsAppError = true;
        authError.statusCode = 401;
        throw authError;
      }
      
      // Generic error
      const genericError = new Error(
        errorMessage || 'Failed to send template message.'
      );
      genericError.statusCode = error.response?.status;
      throw genericError;
    }
  },

  /**
   * Send hello_world template (Testing only)
   * Use this to verify WhatsApp integration is working
   * 
   * @param {string} phoneNumber - Phone number in international format
   * @returns {Promise} Response data
   */
  sendHelloWorld: async (phoneNumber) => {
    try {
      const response = await api.post('/whatsapp/send-hello', {
        to: phoneNumber,
      });
      
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || error.message;
      
      const genericError = new Error(
        errorMessage || 'Failed to send hello_world template.'
      );
      genericError.statusCode = error.response?.status;
      throw genericError;
    }
  },

  /**
   * Verify WhatsApp API configuration
   * Checks if credentials and setup are valid
   * 
   * @returns {Promise} Configuration status
   */
  verifyConfig: async () => {
    try {
      const response = await api.get('/whatsapp/verify');
      return response.data;
    } catch (error) {
      const errorData = error.response?.data || {};
      const errorMessage = errorData.message || error.message;
      
      const configError = new Error(
        errorMessage || 'WhatsApp configuration verification failed.'
      );
      configError.isConfigError = true;
      configError.statusCode = error.response?.status;
      throw configError;
    }
  },

  /**
   * Send bulk template reminders to multiple debtors
   * Useful for mass reminders while respecting 24-hour rule
   * 
   * @param {array} debtorIds - Array of debtor IDs
   * @param {object} options - Template options
   * @returns {Promise} Array of results
   */
  sendBulkReminders: async (debtorIds, options = {}) => {
    try {
      const results = await Promise.allSettled(
        debtorIds.map(debtorId => whatsappApi.sendAIReminderToDebtor(debtorId, options))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        total: debtorIds.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          debtorId: debtorIds[index],
          status: result.status,
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      };
    } catch (error) {
      throw new Error('Bulk reminder operation failed: ' + error.message);
    }
  }
};

export default whatsappApi;
