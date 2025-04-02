# 💰 Virtual Wallet API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green)
![Redis](https://img.shields.io/badge/Redis-7.x-red)

A high-performance financial transaction system handling 500+ concurrent deposits and 300+ payouts with guaranteed data integrity.

## 🚀 Features

### Transaction Integrity
- **Atomic Operations**: All-or-nothing transaction processing
- **Race Condition Prevention**: Queue-based balance updates
- **ACID Compliant**: Fully transactional MongoDB operations

### Performance
- **High Concurrency**: concurrent requests handled
- **Queue System**: BullMQ with Redis backend
- **Optimized Workers**:concurrent transaction processors

### Security
- **JWT Authentication**: signed tokens
- **Password Hashing**: bcryptjs with salt rounds
- **TLS Encryption**: Secure Redis connections

## 📦 Installation

```cmd
# Clone repository
git clone https://github.com/ramsarraf11/Virtual-Wallet-Challenge-Backend.git
cd virtual-wallet

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Starts MongoDB and Redis
redis-server & mongose

# Starts the application
npm start         