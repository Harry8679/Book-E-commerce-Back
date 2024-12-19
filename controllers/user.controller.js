const User = require('../models/user.model');

const userById = async (req, res, next, id) => {
  try {
    // Recherche de l'utilisateur par ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attacher le profil de l'utilisateur à la requête
    req.profile = user;
    next();
  } catch (err) {
    // Gestion des erreurs
    res.status(500).json({ error: 'Error fetching user' });
  }
};

const read = async (req, res) => {
  try {
    // Suppression des informations sensibles avant d'envoyer la réponse
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;

    // Retourner le profil utilisateur
    res.json(req.profile);
  } catch (err) {
    // Gestion des erreurs
    res.status(500).json({ error: 'Error retrieving user profile' });
  }
};


const update = async (req, res) => {
  try {
    // Recherche et mise à jour de l'utilisateur
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true }
    );

    // Si l'utilisateur n'est pas trouvé
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Réponse avec les données mises à jour
    res.json(user);
  } catch (err) {
    // Gestion des erreurs
    res.status(400).json({
      error: 'You are not authorized to perform this action',
    });
  }
};



module.exports = { userById, read, update };
