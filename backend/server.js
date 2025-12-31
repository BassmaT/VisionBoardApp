const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

// load .env from backend folder explicitly
require("dotenv").config({ path: path.join(__dirname, '.env') });

const app = express();

// request logger to see incoming requests in the backend terminal
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// limit JSON body size to prevent large payload abuse
app.use(express.json({ limit: '100kb' }));

// Allow common frontend dev origins during development
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5500';
// include common static server ports (5500, 8080) and localhost variants used during testing
const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://127.0.0.1:5500',
  'http://localhost:5500',
  'http://127.0.0.1:8080',
  'http://localhost:8080',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // otherwise, reject - browser will block the request
    console.warn('Blocked CORS request from origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/visionboard';

// Security: require JWT_SECRET in production, warn otherwise
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production. Exiting.');
  process.exit(1);
} else if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Using development fallback secret. Do NOT use this in production.');
}

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// global unhandled error logging to aid debugging in dev
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/boards", require("./routes/boards"));
app.use("/api/comments", require("./routes/comments"));

// Serve frontend static files from ../docs so frontend and backend share origin in dev
app.use(express.static(path.join(__dirname, '..', 'docs')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});