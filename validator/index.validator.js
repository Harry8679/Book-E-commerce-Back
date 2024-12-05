const { check, validationResult } = require('express-validator');

// Middleware pour valider les données de l'utilisateur
exports.userSignupValidator = [
  // Validation des champs
  check('name', 'Name is required').notEmpty(),
  check('email')
  .notEmpty().withMessage('Email is required') // Vérifie que l'email n'est pas vide
    .isEmail().withMessage('Invalid email format') // Vérifie que c'est un email valide
    .isLength({ min: 3, max: 32 }).withMessage('Email must be between 3 to 32 characters long'), // Vérifie la longueur de l'email
  check('password', 'Password is required').notEmpty(),
  check('password')
    .isLength({ min: 6 }).withMessage('Password must contain at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number'),

  // Gestion des erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg; // Récupérer le premier message d'erreur
      return res.status(400).json({ error: firstError });
    }
    next();
  },
];
