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
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

const update = async (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: 'You are not authorized to perform this action'
        });
      }
    }
  )
};


module.exports = { userById, read, update };
