"use strict";
const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { updateBankingDetails, internalTransfer, deposit } = require("../controllers/internalController");

const router = express.Router();

router.put('/banking', authenticate, updateBankingDetails);
router.post('/transfer', authenticate, internalTransfer);
router.post('/deposit', authenticate, deposit);

module.exports = router;
