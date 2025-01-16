const User = require('../models/user.model');
const { errorHandler } = require('../helpers/dbErrorHandler.helper'); // Import du helper
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const signup = async (req, res) => {
  try {
    const { email } = req.body; // Extraire l'email des données du corps de la requête

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: "The email address is already in use. Please use a different one.",
      });
    }

    // Si l'email n'existe pas, continuer avec l'inscription
    const user = new User(req.body);

    // Sauvegarder dans la base de données
    const savedUser = await user.save();

    // Supprimer les champs sensibles avant de retourner une réponse
    savedUser.salt = undefined;
    savedUser.hashed_password = undefined;

    res.status(201).json({ user: savedUser });
  } catch (err) {
    console.error("Signup error:", err);

    // Gestion des erreurs générales
    res.status(500).json({
      error: "An error occurred during registration. Please try again.",
    });
  }
};


const signin = async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;

    // 🔍 Vérifier si l'utilisateur existe
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User with that email does not exist. Please signup' });
    }

    // 🔑 Vérification du mot de passe
    const isAuthenticated = user.authenticate(password);
    if (!isAuthenticated) {
      console.log('Password mismatch:', {
        storedHash: user.hashed_password,
        inputHash: user.encryptPassword(password),
      });
      return res.status(401).json({ error: 'Email and password do not match' });
    }

    // ✅ Génération du token avec `_id` et `role`
    const token = jwt.sign(
      { _id: user._id, role: user.role }, // 👉 Ajout du rôle ici
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // 🔒 Expiration du token (facultatif)
    );

    // 🍪 Optionnel : Stocker le token dans un cookie
    res.cookie('token', token, { expire: new Date() + 9999 });

    // ✅ Retourner les infos de l'utilisateur (sans données sensibles)
    const { _id, name, email, role } = user;
    return res.json({ token, user: { _id, name, email, role } });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Something went wrong during signin' });
  }
};

// const signin = async (req, res) => {
//   try {
//     const { email: userEmail, password } = req.body;

//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(400).json({ error: 'User with that email does not exist. Please signup' });
//     }

//     // Vérification du mot de passe
//     const isAuthenticated = user.authenticate(password);
//     if (!isAuthenticated) {
//       console.log('Password mismatch:', {
//         storedHash: user.hashed_password,
//         inputHash: user.encryptPassword(password),
//       });
//       return res.status(401).json({ error: 'Email and password do not match' });
//     }

//     // Génération du token
//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
//     res.cookie('token', token, { expire: new Date() + 9999 });

//     const { _id, name, email, role } = user;
//     return res.json({ token, user: { _id, name, email, role } });
//   } catch (err) {
//     console.error('Signin error:', err);
//     return res.status(500).json({ error: 'Something went wrong during signin' });
//   }
// };

const signout = (req, res) => {
  try {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.status(200).json({ message: 'Signout success' });
  } catch (err) {
    console.error('Signout error:', err);
    return res.status(500).json({ error: 'Something went wrong during signout' });
  }
};
const profile = (req, res) => {
  req.profile.salt = undefined; // Masquer le salt pour des raisons de sécurité
  req.profile.hashed_password = undefined; // Masquer le mot de passe hashé
  return res.json(req.profile);
};


module.exports = { signup, signin, signout, profile };
