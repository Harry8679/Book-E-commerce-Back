const { expressjwt } = require('express-jwt');
const User = require('../models/user.model');

// Middleware pour vérifier si l'utilisateur est connecté
exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
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

// exports.isAdmin = (req, res, next) => {
//   if (!req.profile) {
//     return res.status(400).json({ error: 'User profile is not available' });
//   }
//   if (req.profile.role !== 1) {
//     return res.status(403).json({ error: 'Admin resource. Access denied.' });
//   }
//   next();
// };

exports.isAdmin = (req, res, next) => {
  console.log('Admin req.auth', req.auth);
  if (!req.auth) {
    return res.status(400).json({ error: 'Access denied. Authentication required.' });
  }

  if (req.auth.role !== 1) {
    return res.status(403).json({ error: 'Admin resource. Access denied.' });
  }

  next();
};

exports.isAuth = (req, res, next) => {
  const userIdFromAuth = req.auth && req.auth._id; // ID de l'utilisateur connecté
  const userRole = req.auth && req.auth.role; // Rôle de l'utilisateur connecté
  const userIdFromProfile = req.profile && req.profile._id?.toString(); // ID de l'utilisateur ciblé

  console.log('Auth req.auth', req.auth);

  // ✅ Autoriser si : c'est le même utilisateur OU si c'est un admin
  if (req.originalUrl.includes('/orders/create')) {
    return next(); // Autoriser toutes les créations de commandes
  }

  // ✅ Autoriser si : c'est le même utilisateur OU si c'est un admin
  if (req.originalUrl.includes('/orders') && req.method === 'PUT') {
    // Permettre à l'utilisateur de modifier sa propre commande
    if (req.params.orderId) {
      return Order.findById(req.params.orderId)
        .then((order) => {
          if (!order) {
            return res.status(404).json({ error: 'Order not found' });
          }

          if (order.user.toString() === userIdFromAuth || userRole === 1) {
            return next();
          }

          return res.status(403).json({ error: 'Access denied. User is not authorized to modify this order.' });
        })
        .catch((err) => {
          return res.status(500).json({ error: 'Error checking order ownership.' });
        });
    }
  }

  if (!req.auth || (userIdFromAuth !== userIdFromProfile && req.auth.role !== 1)) {
    return res.status(403).json({
      error: 'Access denied. User is not authorized to access this resource.',
    });
  }

  if (userIdFromAuth === userIdFromProfile || userRole === 1) {
    return next();
  }

  return res.status(403).json({
    error: 'Access denied. User is not authorized to access this resource.',
  });
};

// exports.isAuth = (req, res, next) => {
//   const userIdFromAuth = req.auth && req.auth._id; // ID de l'utilisateur connecté
//   const userRole = req.auth && req.auth.role;      // Rôle de l'utilisateur connecté
//   const userIdFromProfile = req.profile && req.profile._id.toString(); // ID de l'utilisateur ciblé

//   console.log('Auth req.auth', req.auth);

//   // ✅ Autoriser si : c'est le même utilisateur OU si c'est un admin
//   if (userIdFromAuth === userIdFromProfile || userRole === 1) {
//     return next();
//   }

//   return res.status(403).json({
//     error: 'Access denied. User is not authorized to access this resource.',
//   });
// };



// exports.isAuth = (req, res, next) => {
//   const userIdFromAuth = req.auth && req.auth._id; // ID extrait du token
//   const userIdFromProfile = req.profile && req.profile._id.toString(); // ID extrait du profil utilisateur

//   if (!userIdFromAuth || userIdFromAuth !== userIdFromProfile) {
//     return res.status(403).json({
//       error: 'Access denied. User is not authorized to access this resource.',
//     });
//   }

//   next();
// };



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
