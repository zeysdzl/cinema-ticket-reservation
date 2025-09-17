const discounts = require('../services/discountService');

exports.validate = async (req, res, next) => {
  try {
    const { code } = req.body || {};
    if (!code) {
      const e = new Error('code is required');
      e.status = 400; throw e;
    }
    const d = await discounts.findByCode(code);
    if (!d) return res.status(404).json({ ok: false, message: 'Code not found' });
    if (d.used) return res.status(409).json({ ok: false, message: 'Code already used', percent: d.percent, id: d.id, used: true });
    res.json({ ok: true, id: d.id, code: d.code, percent: d.percent, used: false });
  } catch (err) { next(err); }
};
