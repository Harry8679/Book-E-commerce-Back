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
    const user = await User.findOneAndUpdate({ _id: req.profile._id },{ $set: req.body },{ new: true });

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

const updatePassword = async (req, res) => {
  try {
    const user = req.profile; // Récupérer l'utilisateur attaché à la requête

    const { currentPassword, newPassword } = req.body;

    // Vérifier si le mot de passe actuel est fourni et correspond
    if (!user.authenticate(currentPassword)) {
      return res.status(400).json({
        error: 'Current password is incorrect',
      });
    }

    // Vérifier si un nouveau mot de passe est fourni et respecte les critères
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long',
      });
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save(); // Sauvegarder les modifications

    res.json({
      message: 'Password updated successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to update password',
    });
  }
};

// Récupérer tous les utilisateurs (sans les mots de passe)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-hashed_password -salt -__v'); // Exclure les champs sensibles

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// 🔄 Mise à jour des informations d'un utilisateur par un administrateur (sauf le mot de passe)
const adminUpdateUser = async (req, res) => {
  try {
    const userId = req.params.userId; // ID de l'utilisateur à modifier
    const updates = req.body;

    // Exclure le mot de passe des modifications
    if (updates.password || updates.hashed_password || updates.salt) {
      return res.status(400).json({ error: "Vous ne pouvez pas modifier le mot de passe ici." });
    }

    // Mise à jour de l'utilisateur (sauf mot de passe)
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-hashed_password -salt -__v');

    if (!updatedUser) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({
      message: "Utilisateur mis à jour avec succès",
      user: updatedUser,
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', err);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur" });
  }
};

const adminGetUserById = async (req, res) => {
  try {
    const userId = req.params.userId;  // Récupération de l'ID depuis les paramètres de l'URL

    const user = await User.findById(userId).select('-hashed_password -salt -__v');  // Exclure les champs sensibles

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json(user);  // Retourner les données de l'utilisateur
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur :', err);
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

module.exports = { userById, read, update, updatePassword, getAllUsers, adminUpdateUser, adminGetUserById };
