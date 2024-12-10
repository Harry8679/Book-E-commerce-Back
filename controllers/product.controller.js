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

    // Correction pour accéder au fichier photo
    const photoFile = Array.isArray(files.photo) ? files.photo[0] : files.photo;

    if (!photoFile || !photoFile.filepath) {
      console.error('Photo file is missing or filepath is undefined');
      return res.status(400).json({
        error: 'No photo uploaded or file path is missing',
      });
    }

    console.log('Attempting to read photo file at:', photoFile.filepath);

    if (!fs.existsSync(photoFile.filepath)) {
      console.error('File does not exist at path:', photoFile.filepath);
      return res.status(400).json({
        error: 'Uploaded file not found',
      });
    }

    // Création du produit
    let product = new Product(fields);

    try {
      // Lecture et affectation de l'image
      product.photo.data = fs.readFileSync(photoFile.filepath);
      product.photo.contentType = photoFile.mimetype;

      // Sauvegarde du produit
      const result = await product.save();
      res.json(result);
    } catch (saveErr) {
      console.error('Error saving the product:', saveErr);
      return res.status(400).json({
        error: errorHandler(saveErr),
      });
    }
  });
};

module.exports = { create };
