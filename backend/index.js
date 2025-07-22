require('dotenv').config();
require('./cron/sendReminders');
const express = require('express');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const cors = require('cors');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/taskRoutes');

// dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

//MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error(err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('Server running on port :',PORT);
});