"use strict";
require('dotenv').config();
const app = require("./app");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;

async function main() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to database (Mongoose)');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
main();
