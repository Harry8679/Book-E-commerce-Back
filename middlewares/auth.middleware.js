const { expressjwt } = require('express-jwt');
const User = require('../models/user.model');

// Middleware pour vérifier si l'utilisateur est connecté
exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET, // Clé secrète pour vérifier le token
  algorithms: ['HS256'], // Algorithme utilisé pour signer le token
  requestProperty: 'auth', // Ajouter les informations du token à req.auth
});

exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id); // Utilisation de `await` au lieu de callback
    if (!user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    req.profile = user; // Ajouter l'utilisateur trouvé à la requête
    next();
  } catch (err) {
    return res.status(500).json({
      error: 'Error fetching user',
    });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role !== 1) {
    return res.status(403).json({
      error: 'Admin resource. Access denied.',
    });
  }
  next();
};


// exports.userById = (req, res, next, id) => {
//   User.findById(id).exec((err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         error: 'User not found',
//       });
//     }
//     req.profile = user;
//     next();
//   });
// };
