const { expressjwt } = require('express-jwt');
const User = require('../models/user.model');
const Order = require('../models/order.model'); // Assurez-vous d'importer le modèle Order

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

exports.isAuth = async (req, res, next) => {
  try {
    const userIdFromAuth = req.auth && req.auth._id; // ID de l'utilisateur connecté
    const userRole = req.auth && req.auth.role; // Rôle de l'utilisateur connecté
    const { orderId } = req.params; // Récupérer l'ID de la commande depuis les paramètres

    console.log('Auth req.auth', req.auth);

    // Vérifier si la requête concerne une commande spécifique
    if (req.originalUrl.includes('/orders') && orderId) {
      // Rechercher la commande par son ID
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Vérifier que l'utilisateur connecté est soit le propriétaire de la commande, soit un administrateur
      if (order.user.toString() === userIdFromAuth || userRole === 1) {
        return next(); // Autoriser l'accès
      } else {
        return res.status(403).json({
          error: 'Access denied. User is not authorized to modify this order.',
        });
      }
    }

    // Autoriser si l'utilisateur accède à une ressource générale
    if (userIdFromAuth || userRole === 1) {
      return next();
    }

    return res.status(403).json({
      error: 'Access denied. User is not authorized to access this resource.',
    });
  } catch (err) {
    console.error('Error in isAuth middleware:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
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
