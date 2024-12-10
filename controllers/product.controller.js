const formidable = require('formidable');
const _ = require('lodash');
const Product = require('../models/product.model');
const fs = require('fs');
const { errorHandler } = require('../helpers/dbErrorHandler.helper');

const create = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true; // Garde les extensions des fichiers

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: 'Image could not be uploaded',
      });
    }

    // Vérification des champs et des fichiers
    let product = new Product(fields);

    if (files.photo) {
      if (!files.photo.path) {
        return res.status(400).json({
          error: 'File path is missing in the uploaded photo',
        });
      }

      // Lecture et sauvegarde de l'image
      try {
        product.photo.data = fs.readFileSync(files.photo.path);
        product.photo.contentType = files.photo.type;
      } catch (fileReadError) {
        return res.status(400).json({
          error: 'Error reading the uploaded photo',
        });
      }
    }

    // Sauvegarde du produit dans la base de données
    product.save((saveErr, result) => {
      if (saveErr) {
        return res.status(400).json({
          error: errorHandler(saveErr),
        });
      }
      res.json(result);
    });
  });
};


module.exports = { create };