
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('/models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cambia-esto';

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.create({ email, password });
    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    res.status(400).json({ message: 'No se pudo registrar: ' + err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Email o contraseña incorrectos' });
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

module.exports = router;