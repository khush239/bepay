"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMestaWebhook = void 0;
const Payout = require("../models/Payout");

const handleMestaWebhook = async (req, res) => {
    try {
        const event = req.body;
        console.log('Received Webhook:', JSON.stringify(event, null, 2));

        // TODO: Verify signature using Mesta SDK or manual check

        if (event.type === 'payout.updated' || event.type === 'order.updated') {
            const { id, status } = event.data;

            // Find payout by Mesta ID
            const payout = await Payout.findOne({ mestaPayoutId: id });

            if (payout) {
                await Payout.findByIdAndUpdate(
                    payout._id,
                    { status }
                );
                console.log(`Updated payout ${payout._id} to ${status}`);
            }
        }
        res.status(200).send('OK');
    }
    catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Server Error');
    }
};
exports.handleMestaWebhook = handleMestaWebhook;
