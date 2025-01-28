const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User', // L'utilisateur qui a laissé le commentaire
      required: true,
    },
    product: {
      type: ObjectId,
      ref: 'Product', // Le produit commenté
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000, // Limitation de la longueur du commentaire
    },
    rating: {
      type: Number,
      min: 1,
      max: 5, // Note sur 5 étoiles
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);