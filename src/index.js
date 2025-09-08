import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import auth from "./routes/auth.js";

// Routes import
// import userRoutes from './routes/user.routes.js';
// Add other routes as needed

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to SignOLingo API' });
});

// Use routes
// app.use('/api/users', userRoutes);
app.use('/api/auth', auth);
// Add other routes as needed

// Database connection
import { connectDB } from './lib/db.js';
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});