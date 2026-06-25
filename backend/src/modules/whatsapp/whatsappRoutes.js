const express = require("express");
const router = express.Router();
const whatsappController = require("./whatsappController");
const aiWebhookController = require("../ai/webhookController"); 

const authenticate = require("../../middleware/authenticate");
const authorize = require("../../middleware/authorize");
const validateRequest = require("../../middleware/validateRequest");
const {
  sendMessageSchema,
  sendToDebtorSchema,
  sendTemplateSchema,
  sendBulkSchema,
  sendHelloSchema,
} = require("./whatsappValidation");

// Use arrow functions to delay execution (Lazy Loading)
// This prevents the "argument handler must be a function" error if there's a circular loop

// Public Webhooks
router.get("/webhook", (req, res, next) => aiWebhookController.verifyWebhook(req, res, next));
router.post("/webhook", (req, res, next) => aiWebhookController.handleWebhook(req, res, next));

// Protected Routes
router.use(authenticate);

router.get("/verify", (req, res, next) => whatsappController.verifyConfig(req, res, next));

router.post("/send-hello", validateRequest(sendHelloSchema), (req, res, next) => 
  whatsappController.sendHelloWorld(req, res, next)
);

router.post("/send", validateRequest(sendMessageSchema), (req, res, next) => 
  whatsappController.sendMessage(req, res, next)
);

router.post("/send-to-debtor/:debtorId", validateRequest(sendToDebtorSchema), (req, res, next) => 
  whatsappController.sendToDebtor(req, res, next)
);

router.post("/send-template", validateRequest(sendTemplateSchema), (req, res, next) => 
  whatsappController.sendTemplate(req, res, next)
);

router.post("/send-bulk", authorize(["ADMIN"]), validateRequest(sendBulkSchema), (req, res, next) => 
  whatsappController.sendBulkMessages(req, res, next)
);

// Explicitly export the router instance
module.exports = router;
