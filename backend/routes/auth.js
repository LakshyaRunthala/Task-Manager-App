const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// defining routes 
router.post('/register', register);
router.post('/login', login);

module.exports = router;
