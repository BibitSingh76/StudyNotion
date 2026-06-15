const mongoose = require('mongoose');

require('dotenv').config();

// connect returns the mongoose connection promise so callers can await it
const defaultUri = 'mongodb://127.0.0.1:27017/studynotion';
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGODB_URI || defaultUri;

if (!process.env.MONGO_URI && !process.env.MONGODB_URL && !process.env.MONGODB_URI) {
    console.warn(`Warning: MONGO_URI not set. Falling back to default local MongoDB: ${mongoUri}`);
}

const wait = ms => new Promise(res => setTimeout(res, ms));

async function connectWithRetry(retries = 5, initialDelayMs = 2000) {
    let attempt = 0;
    let delay = initialDelayMs;
    while (attempt < retries) {
        try {
            // Recent mongoose versions enable the new parser and topology by default
            return await mongoose.connect(mongoUri);
        } catch (err) {
            attempt += 1;
            console.error(`MongoDB connection attempt ${attempt} failed: ${err && err.message ? err.message : err}`);
            if (attempt >= retries) throw err;
            console.log(`Retrying MongoDB connection in ${delay}ms...`);
            await wait(delay);
            delay *= 2;
        }
    }
}

exports.connect = async () => {
    // return the mongoose connect promise with retry/backoff
    return connectWithRetry();
};