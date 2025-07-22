const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require('../models/Task');
const User = require('../models/User');
require('dotenv').config(); // Load .env

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Every day at 9am
cron.schedule('0 9 * * *', async () => {
  try {
    const now = new Date();
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

    const tasks = await Task.find({
      deadline: { $gte: now, $lte: nextDay },
    }).populate('createdBy', 'email name');

    for (const task of tasks) {
      const user = task.createdBy;

      const mailOptions = {
        from: `"Task Manager 📋" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `⏰ Task Reminder: "${task.title}" is due soon!`,
        html: `
          <p>Hi ${user.name || 'User'},</p>
          <p>This is a reminder that your task <strong>${task.title}</strong> is due by <strong>${new Date(task.deadline).toLocaleString()}</strong>.</p>
          <p>Don't forget to complete it!</p>
          <p>— Task Manager App</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    console.log('✅ Reminder emails sent');
  } catch (error) {
    console.error('❌ Error sending reminders:', error.message);
  }
});
