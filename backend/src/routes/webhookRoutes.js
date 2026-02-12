"use strict";
const express = require("express");
const { handleMestaWebhook } = require("../controllers/webhookController");

const router = express.Router();

router.post('/', handleMestaWebhook);

module.exports = router;
