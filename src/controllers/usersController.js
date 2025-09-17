const userService = require('../services/userService');

exports.me = async (req, res) => {
  res.json(req.user);
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      const e = new Error('currentPassword and newPassword are required');
      e.status = 400;
      throw e;
    }
    await userService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ ok: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
};
