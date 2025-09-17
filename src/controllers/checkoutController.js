const service = require('../services/reservationService');
const discounts = require('../services/discountService');

exports.checkout = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items || items.length === 0) {
      const e = new Error('items must be a non-empty array of { sessionId, seats[], discountCode? }');
      e.status = 400;
      throw e;
    }
    const userId = req.user?.id || null;

    const results = [];
    for (const item of items) {
      const { sessionId, seats, customer, discountCode } = item || {};
      try {
        if (!sessionId || !Array.isArray(seats) || seats.length === 0) {
          throw Object.assign(new Error('Invalid item'), { status: 400 });
        }

        // Validate discount (if present)
        let discountPercent = 0;
        let discountId = null;
        let normalizedCode = null;
        if (discountCode) {
          const d = await discounts.findByCode(discountCode);
          if (!d) {
            const e = new Error('Invalid discount code');
            e.status = 400; throw e;
          }
          if (d.used) {
            const e = new Error('Discount code already used');
            e.status = 409; throw e;
          }
          discountPercent = Number(d.percent || 0);
          if (!(discountPercent >= 0 && discountPercent <= 100)) {
            const e = new Error('Invalid discount percent');
            e.status = 400; throw e;
          }
          discountId = d.id;
          normalizedCode = d.code;
        }

        // Create reservation (applies discount to price)
        const reservation = await service.reserveSeats({
          sessionId, seats, customer, userId, discountPercent, discountCode: normalizedCode
        });

        // Mark discount used only after a successful reservation
        if (discountId) await discounts.markUsed(discountId);

        results.push({ success: true, reservation });
      } catch (err) {
        results.push({
          success: false,
          error: err.message || 'Failed',
          status: err.status || 400,
          sessionId: item?.sessionId,
          seats: item?.seats
        });
      }
    }

    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
};
