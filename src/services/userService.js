const store = require('./dataStore');
const { uid } = require('./id');

const USERS_FILE = 'users.json';

async function getUsers() {
  return store.read(USERS_FILE);
}

async function saveUsers(users) {
  await store.write(USERS_FILE, users);
}

async function findByEmail(email) {
  const users = await getUsers();
  const e = (email || '').toLowerCase();
  return users.find(u => (u.email || '').toLowerCase() === e) || null;
}

async function createUser({ name, surname, email, password }) {
  const users = await getUsers();
  const exists = users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
  if (exists) {
    const e = new Error('Email already registered');
    e.status = 409;
    throw e;
  }
  const user = { id: uid('u_'), name, surname, email, password };
  await saveUsers([...users, user]);
  return user;
}

async function changePassword(userId, currentPassword, newPassword) {
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) {
    const e = new Error('User not found');
    e.status = 404;
    throw e;
  }
  if (users[idx].password !== currentPassword) {
    const e = new Error('Current password is incorrect');
    e.status = 400;
    throw e;
  }
  users[idx].password = newPassword;
  await saveUsers(users);
  return true;
}

module.exports = { getUsers, saveUsers, findByEmail, createUser, changePassword };
