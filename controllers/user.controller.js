const User = require('../models/user.model');

const userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error : 'User not found'
      });
    }
    req.profile = user;
    next();
  })
}

module.exports = { userById }