const Category = require("../models/category.model");

const create = async (req, res) => {
  try {
    // Création d'une nouvelle catégorie avec les données du corps de la requête
    const category = new Category(req.body);

    // Sauvegarde de la catégorie dans la base de données
    const savedCategory = await category.save();

    // Réponse avec les données de la catégorie sauvegardée
    res.json({ category: savedCategory });
  } catch (err) {
    // Gestion des erreurs avec le helper
    const message = errorHandler(err); 
    res.status(400).json({ error: message });
  }
};

// Lister toutes les catégories
const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Trier par nom (ordre alphabétique)
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Récupérer une catégorie par son ID
const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(400).json({ error: "Error fetching the category" });
  }
};

// Modifier une catégorie
const updateCategory = async (req, res) => {
  try {
    const category = req.category; // La catégorie est attachée par le middleware paramétrique

    // Mise à jour des champs
    category.name = req.body.name || category.name;

    const updatedCategory = await category.save(); // Sauvegarde après modification
    res.json(updatedCategory);
  } catch (err) {
    const message = errorHandler(err);
    res.status(400).json({ error: message });
  }
};

module.exports = { create, listCategories, getCategoryById, updateCategory };