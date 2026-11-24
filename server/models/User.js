const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 }
}, { timestamps: true });

// Hashea la contraseña antes de guardar
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const adminPrueba = [
  { login: 'admin', password: '1234' },
];

function findUser(login, password) {
  return adminPrueba.find(u => u.login === login && u.password === password) || null;
}

module.exports = { findUser };


module.exports = mongoose.model('User', userSchema);