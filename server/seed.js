const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user.model');

const TEST_USER = {
  name: 'admin',
  email: 'admin@balatro.com',
  password: '12345678',
};

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/balatro');

  if (await User.exists({ email: TEST_USER.email })) {
    console.log('El usuario de prueba ya existe');
  } else {
    await User.create({
      name: TEST_USER.name,
      email: TEST_USER.email,
      passwordHash: await bcrypt.hash(TEST_USER.password, 10),
    });
    console.log('Usuario de prueba creado');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});