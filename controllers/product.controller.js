const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const Product = require('../models/product.model');
const { errorHandler } = require('../helpers/dbErrorHandler.helper');

// Fonction utilitaire pour nettoyer les champs
const sanitizeField = (field) => {
  if (Array.isArray(field)) {
    return field[0]; // Prend la première valeur si c'est un tableau
  }
  return field; // Retourne la valeur telle quelle
};

const create = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.multiples = false;
  form.maxFileSize = 5 * 1024 * 1024; // Limite de taille : 5 MB
  form.uploadDir = path.resolve(__dirname, '../uploads'); // Chemin absolu

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    // Nettoyage des champs
    const sanitizedFields = {
      name: sanitizeField(fields.name),
      description: sanitizeField(fields.description),
      price: Number(sanitizeField(fields.price)),
      category: sanitizeField(fields.category),
      quantity: Number(sanitizeField(fields.quantity)),
      shipping: sanitizeField(fields.shipping) === 'true',
    };

    if (!sanitizedFields.name || !sanitizedFields.description || isNaN(sanitizedFields.price)) {
      return res.status(400).json({ error: 'Some required fields are missing or invalid' });
    }

    // Création du produit
    let product = new Product(sanitizedFields);

    try {
      if (files.photo) {
        const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        if (photoFile && photoFile.filepath) {
          const stats = fs.statSync(photoFile.filepath);
          if (stats.size > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image should not exceed 2MB' });
          }
          product.photo = {
            data: fs.readFileSync(photoFile.filepath),
            contentType: photoFile.mimetype,
          };
        }
      }

      const result = await product.save();
      res.json(result);
    } catch (saveErr) {
      console.error('Error saving the product:', saveErr);
      return res.status(400).json({ error: errorHandler(saveErr) });
    }
  });
};

const productById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    req.product = product;
    next();
  } catch (err) {
    console.error('Error finding product by ID:', err);
    res.status(400).json({ error: 'An error occurred while retrieving the product' });
  }
};

const getProductById = (req, res) => {
  try {
    req.product.photo = undefined; // Retirer la photo des résultats
    res.json(req.product);
  } catch (err) {
    console.error('Error retrieving product:', err);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select('-photo'); // Exclut la propriété photo
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(400).json({ error: 'Could not retrieve products' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = req.product;
    const deletedProduct = await product.deleteOne();
    res.json({
      message: 'Product deleted successfully',
      deletedProduct,
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'An unexpected error occurred while deleting the product' });
  }
};

const updateProduct = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.multiples = false;
  form.maxFileSize = 5 * 1024 * 1024; // Limite de taille : 5 MB

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }

    try {
      let product = req.product;
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Nettoyage des champs
      const sanitizedFields = {
        name: sanitizeField(fields.name),
        description: sanitizeField(fields.description),
        price: fields.price ? Number(sanitizeField(fields.price)) : product.price,
        category: sanitizeField(fields.category),
        quantity: fields.quantity ? Number(sanitizeField(fields.quantity)) : product.quantity,
        shipping: fields.shipping !== undefined ? sanitizeField(fields.shipping) === 'true' : product.shipping,
      };

      // Mise à jour des champs
      product.name = sanitizedFields.name || product.name;
      product.description = sanitizedFields.description || product.description;
      product.price = sanitizedFields.price;
      product.category = sanitizedFields.category || product.category;
      product.quantity = sanitizedFields.quantity;
      product.shipping = sanitizedFields.shipping;

      // Mise à jour de l'image
      if (files.photo) {
        const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        if (photoFile && photoFile.filepath) {
          const stats = fs.statSync(photoFile.filepath);
          if (stats.size > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'Image should not exceed 2MB' });
          }
          product.photo = {
            data: fs.readFileSync(photoFile.filepath),
            contentType: photoFile.mimetype,
          };
        }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (saveErr) {
      console.error('Error updating the product:', saveErr);
      res.status(500).json({ error: 'An unexpected error occurred while updating the product' });
    }
  });
};

/**
 * 
 * sell / arrival
 * by sell = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params are sent, the all products are returned
 */
const list = async (req, res) => {
  try {
    const order = req.query.order ? req.query.order : 'asc';
    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;

    const products = await Product.find()
      .select('-photo')
      .populate('category')
      .sort([[sortBy, order]])
      .limit(limit);

    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(400).json({
      error: 'Products not found',
    });
  }
};

/*
 * It will find the products based on the req product category
 * other that has the same category, will be returned
*/
const listRelated = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;

    // Récupération du produit actuel pour sa catégorie
    const product = await Product.findById(req.params.productId).select('category');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Recherche des produits de la même catégorie
    const products = await Product.find({ 
        category: product.category, 
        _id: { $ne: req.params.productId }, // Exclut le produit actuel
      })
      .select('-photo')
      .populate('category', '_id name')
      .limit(limit);

    res.json(products);
  } catch (err) {
    console.error("Error fetching related products:", err);
    res.status(400).json({
      error: 'Related products not found',
    });
  }
};

const listCategories = async (req, res) => {
  res.send('List Categories');
};


module.exports = { create, productById, getAllProducts, getProductById, deleteProduct, updateProduct, list, listRelated, listCategories };
