const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

exports.register = async (req, res, next) => {
  try {
    const { name, surname, email, password } = req.body || {};
    if (!name || !surname || !email || !password) {
      const e = new Error('name, surname, email, password are required');
      e.status = 400;
      throw e;
    }
    const user = await userService.findByEmail(email);
    if (user) {
      const e = new Error('Email already registered');
      e.status = 409;
      throw e;
    }
    const created = await userService.createUser({ name, surname, email, password });
    const payload = { id: created.id, email: created.email, name: created.name, surname: created.surname };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: payload });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      const e = new Error('email and password are required');
      e.status = 400;
      throw e;
    }
    const user = await userService.findByEmail(email);
    if (!user || user.password !== password) {
      const e = new Error('Invalid email or password');
      e.status = 401;
      throw e;
    }
    const payload = { id: user.id, email: user.email, name: user.name, surname: user.surname };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
};
