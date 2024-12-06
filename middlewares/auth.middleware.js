const { expressjwt } = require('express-jwt');
const User = require('../models/user.model');

// Middleware pour vérifier si l'utilisateur est connecté
exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET, // Clé secrète pour vérifier le token
  algorithms: ['HS256'], // Algorithme utilisé pour signer le token
  requestProperty: 'auth', // Ajouter les informations du token à req.auth
});

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    req.profile = user;
    next();
  });
};
