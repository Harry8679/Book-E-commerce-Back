const expressJwt = require('express-jwt');

// Middleware pour vérifier si l'utilisateur est connecté
exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, // Clé secrète pour vérifier le token
  algorithms: ['HS256'], // Algorithme utilisé pour signer le token
  userProperty: 'auth', // Ajouter les informations du token à req.auth
});
