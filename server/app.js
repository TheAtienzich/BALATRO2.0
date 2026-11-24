const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API
app.use('/api/auth', require('./routes/auth'));

// Frontend: solo se sirve la carpeta frontend
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

mongoose.connect('mongodb://127.0.0.1:27017/balatro')
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
      console.log(`Abre: http://localhost:${PORT}/src/pages/menu.html`);
    });
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB:', err.message);
  });