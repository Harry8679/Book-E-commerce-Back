const Category = require("../models/category.model");

const create = async (req, res) => {
  try {
    // Création d'un nouvel utilisateur avec les données du corps de la requête
    const category = new Category(req.body);

    // Sauvegarde de l'utilisateur dans la base de données
    const savedCategory = await category.save();

    // Réponse avec les données de l'utilisateur sauvegardé
    res.json({ category: savedCategory });
  } catch (err) {
    // Gestion des erreurs avec le helper
    const message = errorHandler(err); 
    res.status(400).json({ error: message });
  }
};

module.exports = { create };