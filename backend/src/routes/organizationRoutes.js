"use strict";
const express = require("express");
const { getOrganization, updateOrganization, submitKyc } = require("../controllers/organizationController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get('/', authenticate, getOrganization);
router.put('/', authenticate, updateOrganization);
router.post('/kyc', authenticate, submitKyc);

module.exports = router;
