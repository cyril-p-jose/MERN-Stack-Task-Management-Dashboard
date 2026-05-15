const Activity = require("../models/Activity");

const getActivities = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);
    const items = await Activity.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

module.exports = { getActivities };
