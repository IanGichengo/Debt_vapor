const axios = require("axios");
const config = require("../../config/mpesa");

let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  if (accessToken && tokenExpiry > Date.now()) {
    return accessToken;
  }

  const auth = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString("base64");

  const response = await axios.get(
    `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + 3500 * 1000;

  return accessToken;
};

const stkPush = async ({ phone, amount, reference }) => {
  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);

  const password = Buffer.from(
    config.shortcode + config.passKey + timestamp
  ).toString("base64");

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: config.shortcode,
    PhoneNumber: phone,
    CallBackURL: config.callbackUrl,
    AccountReference: reference,
    TransactionDesc: "Test",
  };

  const response = await axios.post(
    `${config.baseUrl}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

module.exports = { stkPush };
