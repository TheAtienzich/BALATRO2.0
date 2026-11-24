const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const JWT_SECRET = process.env.JWT_SECRET || ' ';

async function login(email, password) {
  const user = await User.findOne({ email });
  if (!user) return null;

  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return null;

  return jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
}

async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw Object.assign(new Error('Faltan datos'), { status: 400 });
  }
  if (password.length < 8) {
    throw Object.assign(new Error('La contraseña debe tener al menos 8 caracteres'), { status: 400 });
  }
  if (await User.exists({ email })) {
    throw Object.assign(new Error('Ese correo ya está registrado'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  return { id: user._id, name: user.name, email: user.email };
}

module.exports = { login, register };