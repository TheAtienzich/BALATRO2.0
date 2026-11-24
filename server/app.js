const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.use('/api/auth', require('./router/auth'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

mongoose.connect('mongodb://127.0.0.1:27017/balatro')
  .then(() => app.listen(3000, () => console.log('http://localhost:3000')));