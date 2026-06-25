module.exports = {
  baseUrl: "https://sandbox.safaricom.co.ke",
  shortcode: process.env.MPESA_SHORTCODE || "174379",
  passKey: process.env.MPESA_PASSKEY,
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
};
