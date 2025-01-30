const { expressjwt } = require('express-jwt');
const User = require('../models/user.model');
const Order = require('../models/order.model'); // Assurez-vous d'importer le modèle Order

// Middleware pour vérifier si l'utilisateur est connecté
exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // Algorithme utilisé pour signer le token
  requestProperty: 'auth', // Ajouter les informations du token à req.auth
  credentialsRequired: true, // Force l'authentification
});

// Middleware pour charger l'utilisateur par ID
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

// Middleware pour vérifier si l'utilisateur est un administrateur
exports.isAdmin = (req, res, next) => {
  if (!req.auth) {
    return res.status(400).json({ error: 'Access denied. Authentication required.' });
  }

  if (req.auth.role !== 1) { // 1 est généralement l'ID pour les administrateurs
    return res.status(403).json({ error: 'Admin resource. Access denied.' });
  }

  next();
};

// Middleware pour vérifier si l'utilisateur est authentifié avant d'effectuer une action
// Middleware pour vérifier si l'utilisateur est authentifié avant d'effectuer une action
exports.isAuth = async (req, res, next) => {
  try {
    const userIdFromAuth = req.auth && req.auth._id; // ID de l'utilisateur connecté
    const userRole = req.auth && req.auth.role; // Rôle de l'utilisateur connecté

    // Vérification si l'utilisateur est autorisé à voir une commande spécifique
    if (req.originalUrl.includes('/orders')) {
      const { orderId } = req.params; // Récupérer l'ID de la commande depuis les paramètres
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Vérifier si l'utilisateur connecté est soit le propriétaire de la commande, soit un administrateur
      if (order.user.toString() === userIdFromAuth.toString() || userRole === 1) {
        return next(); // Autoriser l'accès
      } else {
        return res.status(403).json({
          error: 'Access denied. User is not authorized to modify this order.',
        });
      }
    }

    // Autoriser l'accès à toute autre ressource si l'utilisateur est authentifié ou si c'est un administrateur
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

// exports.isAuth = async (req, res, next) => {
//   try {
//     const userIdFromAuth = req.auth && req.auth._id; // ID de l'utilisateur connecté
//     const userRole = req.auth && req.auth.role; // Rôle de l'utilisateur connecté

//     // Vérification si l'utilisateur est autorisé à modifier une commande spécifique
//     if (req.originalUrl.includes('/orders')) {
//       const { orderId } = req.params; // Récupérer l'ID de la commande depuis les paramètres
//       const order = await Order.findById(orderId);

//       if (!order) {
//         return res.status(404).json({ error: 'Order not found' });
//       }

//       // Vérifier si l'utilisateur connecté est soit le propriétaire de la commande, soit un administrateur
//       if (order.user.toString() === userIdFromAuth || userRole === 1) {
//         return next(); // Autoriser l'accès
//       } else {
//         return res.status(403).json({
//           error: 'Access denied. User is not authorized to modify this order.',
//         });
//       }
//     }

//     // Autoriser l'accès à toute autre ressource si l'utilisateur est authentifié ou si c'est un administrateur
//     if (userIdFromAuth || userRole === 1) {
//       return next();
//     }

//     return res.status(403).json({
//       error: 'Access denied. User is not authorized to access this resource.',
//     });
//   } catch (err) {
//     console.error('Error in isAuth middleware:', err);
//     return res.status(500).json({ error: 'Internal server error.' });
//   }
// };

// Middleware pour vérifier l'autorisation d'accès pour les routes publiques ou administratives
exports.isPublicOrAdmin = async (req, res, next) => {
  try {
    const userRole = req.auth && req.auth.role; // Rôle de l'utilisateur connecté

    // Si l'utilisateur est un administrateur, il a accès à toutes les routes
    if (userRole === 1) {
      return next();
    }

    // Si l'utilisateur n'est pas un administrateur, restreindre l'accès
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  } catch (err) {
    console.error('Error in isPublicOrAdmin middleware:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};