/**
 * Phone Number Helper Utility
 * Handles Kenyan phone number validation, normalization, and formatting
 */

/**
 * Normalize phone number to Kenyan format (254XXXXXXXXX)
 * @param {String} phone - Phone number in various formats
 * @returns {String|null} Normalized phone number or null if invalid
 */
const normalizeKenyanPhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return null;
  }

  // Remove all non-numeric characters
  let cleaned = phone.replace(/[^0-9]/g, "");

  // Handle different Kenyan formats
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    // Already in correct format: 254712345678
    return cleaned;
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    // Local format: 0712345678 -> 254712345678
    return "254" + cleaned.substring(1);
  } else if (cleaned.startsWith("7") && cleaned.length === 9) {
    // Missing leading 0: 712345678 -> 254712345678
    return "254" + cleaned;
  } else if (cleaned.startsWith("1") && cleaned.length === 9) {
    // Missing leading 0 (Safaricom 1XX): 112345678 -> 254112345678
    return "254" + cleaned;
  } else if (cleaned.length === 12 && !cleaned.startsWith("254")) {
    // International format with different country code - reject
    return null;
  }

  // Invalid format
  return null;
};

/**
 * Validate if phone number is a valid Kenyan mobile number
 * @param {String} phone - Phone number to validate
 * @returns {Boolean} True if valid Kenyan mobile number
 */
const isValidKenyanPhone = (phone) => {
  const normalized = normalizeKenyanPhone(phone);
  if (!normalized) {
    return false;
  }

  // Kenyan mobile prefixes (after 254): 7XX, 1XX (Safaricom/Airtel/Telkom)
  const validPrefixes = /^254(7[0-9]{8}|1[0-9]{8})$/;
  return validPrefixes.test(normalized);
};

/**
 * Format phone number for display (0712 345 678)
 * @param {String} phone - Phone number to format
 * @returns {String} Formatted phone number or original if invalid
 */
const formatKenyanPhone = (phone) => {
  const normalized = normalizeKenyanPhone(phone);
  if (!normalized) {
    return phone;
  }

  // Convert 254712345678 -> 0712 345 678
  const localFormat = "0" + normalized.substring(3);
  return localFormat.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
};

/**
 * Format phone number for M-Pesa (254712345678)
 * @param {String} phone - Phone number to format
 * @returns {String|null} M-Pesa formatted phone or null if invalid
 */
const formatForMpesa = (phone) => {
  return normalizeKenyanPhone(phone);
};

/**
 * Check if two phone numbers are the same (handles different formats)
 * @param {String} phone1 - First phone number
 * @param {String} phone2 - Second phone number
 * @returns {Boolean} True if numbers match
 */
const phonesMatch = (phone1, phone2) => {
  const normalized1 = normalizeKenyanPhone(phone1);
  const normalized2 = normalizeKenyanPhone(phone2);

  if (!normalized1 || !normalized2) {
    return false;
  }

  return normalized1 === normalized2;
};

module.exports = {
  normalizeKenyanPhone,
  isValidKenyanPhone,
  formatKenyanPhone,
  formatForMpesa,
  phonesMatch,
};
