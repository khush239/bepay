"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcrypt = require("bcryptjs");
const jwt_1 = require("../utils/jwt");
const User = require("../models/User");
const Organization = require("../models/Organization");

const register = async (req, res) => {
    try {
        const { email, password, name, organizationName } = req.body;
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            name,
            role: 'USER', // Default role
        });

        // Create organization
        const organization = await Organization.create({
            name: organizationName || `${name}'s Organization`,
            userId: user._id,
            kycStatus: 'PENDING',
        });

        const token = (0, jwt_1.generateToken)(user._id);
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: organization._id,
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const organization = await Organization.findOne({ userId: user._id });

        const token = (0, jwt_1.generateToken)(user._id);
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: organization?._id,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;

const getMe = async (req, res) => {
    try {
        const user = req.user; // Set by authMiddleware
        const organization = await Organization.findOne({ userId: user._id });
        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                organizationId: organization?._id,
                accountNumber: user.accountNumber,
                bankName: user.bankName,
                balance: organization?.balance || 0,
            },
        });
    }
    catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getMe = getMe;
