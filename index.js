const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./configs/db');
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { startTransactionWorkers } = require('./workers/transactionWorker');

const app = express();

app.use(apiLimiter);
app.use(express.json());
app.use(cors());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    connectDB();
    startTransactionWorkers();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();