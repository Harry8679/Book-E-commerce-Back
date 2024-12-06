const User = require('../models/user.model');
const { errorHandler } = require('../helpers/dbErrorHandler.helper'); // Import du helper
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

const signup = async (req, res) => {
  try {
    console.log('req.body', req.body);

    // Création d'un nouvel utilisateur avec les données du corps de la requête
    const user = new User(req.body);

    // Sauvegarde de l'utilisateur dans la base de données
    const savedUser = await user.save();

    user.salt = undefined;
    user.hashed_password = undefined;

    // Réponse avec les données de l'utilisateur sauvegardé
    res.json({ user: savedUser });
  } catch (err) {
    // Gestion des erreurs avec le helper
    const message = errorHandler(err); 
    res.status(400).json({ error: message });
  }
};

const signin = async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ error: 'User with that email does not exist. Please signup' });
    }

    // Vérification du mot de passe
    const isAuthenticated = user.authenticate(password);
    if (!isAuthenticated) {
      console.log('Password mismatch:', {
        storedHash: user.hashed_password,
        inputHash: user.encryptPassword(password),
      });
      return res.status(401).json({ error: 'Email and password do not match' });
    }

    // Génération du token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie('token', token, { expire: new Date() + 9999 });

    const { _id, name, email } = user;
    return res.json({ token, user: { _id, name, email } });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(500).json({ error: 'Something went wrong during signin' });
  }
};

const signout = (req, res) => {
  try {
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.status(200).json({ message: 'Signout success' });
  } catch (err) {
    console.error('Signout error:', err);
    return res.status(500).json({ error: 'Something went wrong during signout' });
  }
};


module.exports = { signup, signin, signout };
