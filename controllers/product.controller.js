const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const Product = require('../models/product.model');
const { errorHandler } = require('../helpers/dbErrorHandler.helper');

const create = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.multiples = false;
  form.maxFileSize = 5 * 1024 * 1024; // Limite de taille : 5 MB
  form.uploadDir = path.resolve(__dirname, '../uploads'); // Chemin absolu

  // Journaux des événements
  form.on('fileBegin', (name, file) => {
    console.log('File upload started:', { name, file });
  });

  form.on('file', (name, file) => {
    console.log('File received:', { name, file });
  });

  form.on('error', (err) => {
    console.error('Formidable error:', err);
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing the form:', err);
      return res.status(400).json({ error: 'Image could not be uploaded' });
    }
  
    console.log('Fields:', fields);
    console.log('Files:', files);
  
    // Correction : Assurez-vous que chaque champ est converti en son type attendu
    const sanitizedFields = {
      name: fields.name?.toString(), // Convertit en chaîne
      description: fields.description?.toString(),
      price: Number(fields.price), // Convertit en nombre
      category: fields.category?.toString(),
      quantity: Number(fields.quantity),
      shipping: fields.shipping === 'true', // Convertit en booléen
    };
  
    console.log('Sanitized Fields:', sanitizedFields);
  
    // Validation si un champ critique est manquant
    if (!sanitizedFields.name || !sanitizedFields.description || isNaN(sanitizedFields.price)) {
      return res.status(400).json({ error: 'Some required fields are missing or invalid' });
    }
  
    // Création du produit avec les champs nettoyés
    let product = new Product(sanitizedFields);
  
    try {
      // Traitement de l'image
      const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;
      if (photoFile && photoFile.filepath) {
        product.photo.data = fs.readFileSync(photoFile.filepath);
        product.photo.contentType = photoFile.mimetype;
      }
  
      // Sauvegarde du produit
      const result = await product.save();
      res.json(result);
    } catch (saveErr) {
      console.error('Error saving the product:', saveErr);
      return res.status(400).json({ error: errorHandler(saveErr) });
    }
  });
  
};

module.exports = { create };
