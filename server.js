const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://frank-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/answers', require('./routes/answerRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Basic route with CORS headers
app.get('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'success',
    message: 'Server is running and connected to database'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    status: 'error',
    message: err.message || 'Something went wrong!' 
  });
});

// Handle port in use error
const startServer = async (retries = 5) => {
  const PORT = process.env.PORT || 5001;
  
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        resolve();
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${PORT} is in use, trying to close existing connection...`);
          require('child_process').exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
            if (error) {
              console.error(`Failed to kill process on port ${PORT}:`, error);
              reject(error);
            } else {
              console.log(`Successfully killed process on port ${PORT}`);
              setTimeout(() => {
                server.listen(PORT);
              }, 1000);
            }
          });
        } else {
          reject(err);
        }
      });
    });
  } catch (err) {
    if (retries > 0) {
      console.log(`Retrying server start... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return startServer(retries - 1);
    } else {
      console.error('Failed to start server after multiple attempts:', err);
      process.exit(1);
    }
  }
};

startServer(); 