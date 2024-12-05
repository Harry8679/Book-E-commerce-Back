const User = require('../models/user.model');
const { errorHandler } = require('../helpers/dbErrorHandler.helper'); // Import du helper

const signup = async (req, res) => {
  try {
    console.log('req.body', req.body);

    // Création d'un nouvel utilisateur avec les données du corps de la requête
    const user = new User(req.body);

    // Sauvegarde de l'utilisateur dans la base de données
    const savedUser = await user.save();

    // Réponse avec les données de l'utilisateur sauvegardé
    res.json({ user: savedUser });
  } catch (err) {
    // Gestion des erreurs avec le helper
    const message = errorHandler(err); 
    res.status(400).json({ error: message });
  }
};

module.exports = { signup };
