"use strict";
const axios = require("axios");

const MESTA_API_URL = process.env.MESTA_API_URL || 'https://api.stg.mesta.xyz/v1';
const API_KEY = process.env.MESTA_API_KEY;
const API_SECRET = process.env.MESTA_API_SECRET;

const client = axios.create({
    baseURL: MESTA_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'x-api-secret': API_SECRET
    },
});
const createMestaBeneficiary = async (data) => {
    // In production, this would call Mesta API
    // const response = await client.post('/beneficiaries', data);
    // return response.data;
    // For Sandbox/Demo without full Mesta approval, we might mock this or try real if keys work.
    // Let's try to simulate a successful call if it fails (graceful degradation for demo)
    try {
        console.log('Sending beneficiary to Mesta:', data);
        // const response = await client.post('/beneficiaries', data); // Uncomment if keys are active
        // return response.data;
        return { id: `ben_${Date.now()}`, ...data, status: 'ACTIVE' };
    }
    catch (error) {
        console.warn('Mesta API call failed, using mock data', error);
        return { id: `ben_${Date.now()}`, ...data, status: 'ACTIVE' };
    }
};
exports.createMestaBeneficiary = createMestaBeneficiary;
const createMestaPayout = async (data) => {
    try {
        console.log('Sending payout to Mesta:', data);
        // const response = await client.post('/orders', data); // Uncomment if keys are active
        // return response.data;
        return { id: `ord_${Date.now()}`, status: 'PENDING', ...data };
    }
    catch (error) {
        console.warn('Mesta API call failed, using mock data', error);
        return { id: `ord_${Date.now()}`, status: 'PENDING', ...data };
    }
};
exports.createMestaPayout = createMestaPayout;
exports.default = client;
