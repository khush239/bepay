const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: 'USER', enum: ['USER', 'ADMIN'] },
    accountNumber: { type: String, unique: true, sparse: true },
    bankName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
