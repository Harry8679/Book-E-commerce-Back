const User = require('../models/user.model');

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
    // Gestion des erreurs
    res.status(400).json({ err: err.message });
  }
};

module.exports = { signup };
