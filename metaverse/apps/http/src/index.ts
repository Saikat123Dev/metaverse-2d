import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

// Environment Configuration (e.g., from .env or config)
const PORT = process.env.PORT || 3000;

// Middleware to log requests
app.use(morgan('combined')); // Logging format can be customized

// Middleware for body parsing
app.use(json());
app.use(urlencoded({ extended: true }));

// Middleware for security headers
app.use(helmet());

// Enable CORS for specific origins or all
const corsOptions = {
  origin: 'https://your-allowed-origin.com', // Or set '*' for all
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate Limiting (set maximum requests per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});
app.use(limiter);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
