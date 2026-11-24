const { Router } = require('express');
const authService = require('../models/auth');

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await authService.login(email, password);
    if (!token) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    res.json({ accessToken: token });
  } catch (err) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
});

module.exports = router;