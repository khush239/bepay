"use strict";
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const payoutsRoutes = require("./routes/payoutsRoutes");
const internalRoutes = require("./routes/internalRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/webhooks', webhookRoutes);

app.get('/api', (req, res) => {
    res.json({ message: 'Bepay API is running' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to bepay money API' });
});
module.exports = app;
