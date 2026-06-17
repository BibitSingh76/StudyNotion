try {
    require("dotenv").config();
} catch (error) {
    console.warn("dotenv is not installed; using environment variables from the host.");
}

// Prefer public DNS for SRV resolution (works around local DNS/proxy that blocks SRV)
const dns = require('dns');
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (e) {
    console.warn('Could not set DNS servers programmatically:', e && e.message ? e.message : e);
}

// Provide safe development defaults to avoid startup failures when env vars are missing.
if (!process.env.MONGO_URI && !process.env.MONGODB_URL && !process.env.MONGODB_URI) {
    process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studynotion'
}
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me'
    console.warn('Warning: JWT_SECRET not set. Using development default. Do not use in production.');
}

const express =require("express");
const app = express();

const userRoutes =require("./routes/User");
const profileRoutes =require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactRoutes = require("./routes/Contact");

const database = require("./config/database");
const cookieParser =require("cookie-parser");
const bodyParser = require('body-parser');
const cors = require("cors");
const {cloudinaryConnect} =require("./config/cloudinary");
const fileUpload =require("express-fileupload");
const os = require('os');
const PORT = process.env.PORT || 4000;
// Build allowed origins from environment variables.
// Support a single `CLIENT_URL` or a comma-separated `CLIENT_URLS`.
const defaultLocalOrigins = ["http://localhost:3000", "http://localhost:3001"];
const envClientUrl = (process.env.CLIENT_URL || "").trim();
const envClientUrls = (process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const allowedOrigins = Array.from(new Set([
    ...defaultLocalOrigins,
    ...(envClientUrl ? [envClientUrl] : []),
    ...envClientUrls,
]));

//middlewares
// Guard against empty JSON bodies that cause body-parser to throw
app.use((req, res, next) => {
    const ct = req.headers['content-type'];
    const len = req.headers['content-length'];
    if (ct && ct.includes('application/json') && (!len || len === '0')) {
        delete req.headers['content-type'];
    }
    next();
});

// Use body-parser with a type guard to skip parsing when Content-Type is
// application/json but the body is empty (prevents "Unexpected end of JSON input").
app.use(bodyParser.json({
    type: (req) => {
        const ct = req.headers['content-type'];
        const len = req.headers['content-length'];
        if (ct && ct.includes('application/json') && (!len || len === '0')) {
            return false;
        }
        return (ct && ct.includes('application/json')) || false;
    },
    limit: '10mb',
}));
app.use(cookieParser());

// Simple request logger to help debug 404s from frontend
app.use((req, res, next) => {
    try {
        console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
    } catch (e) {
        // ignore logging errors
    }
    next();
});

// Use a custom origin function so we return the appropriate
// Access-Control-Allow-Origin header only for allowed origins. Place this
// middleware early so preflight OPTIONS are handled properly.
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error(`CORS policy: origin ${origin} not allowed`));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    })
);

// CORS middleware above already handles preflight requests; explicit
// app.options() caused path-to-regexp errors in this environment and
// is therefore removed.

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir: process.env.TEMP_FILE_DIR || os.tmpdir(),
    })
)

// Start app only after DB connects and cloudinary connects
const startServer = async () => {
    try {
        await database.connect();
        console.log('Connected to MongoDB');

        //cloudinary connection
        cloudinaryConnect();

        //routes
        app.use("/api/v1/auth", userRoutes);
        app.use("/api/v1/profile", profileRoutes);
        app.use("/api/v1/course", courseRoutes);
        app.use("/api/v1/payment", paymentRoutes);
        app.use("/api/v1/reach", contactRoutes);

        //default route
        app.get("/", (req, res) => {
            return res.json({ success: true, message: 'Your server is up and running....' });
        });

        //now activate server
        app.listen(PORT, () => {
            console.log(`app is running at ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to start server:', error.message || error);
        process.exit(1);
    }
};

startServer();

