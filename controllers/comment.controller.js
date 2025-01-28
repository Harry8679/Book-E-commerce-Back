const Comment = require('../models/comment.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

/**
 * Vérifier si l'utilisateur a acheté le produit avant d'ajouter un commentaire
 */
exports.createComment = async (req, res) => {
  try {
    const { productId, text, rating } = req.body;
    const userId = req.auth._id;

    // Vérifier si l'utilisateur a commandé ce produit
    const orderExists = await Order.findOne({
      user: userId,
      'products.product': productId,
      isPaid: true,
    });

    if (!orderExists) {
      return res.status(403).json({
        message: "Vous ne pouvez commenter que les produits que vous avez achetés.",
      });
    }

    // Créer un nouveau commentaire
    const comment = new Comment({
      user: userId,
      product: productId,
      text,
      rating,
    });

    // Sauvegarder le commentaire
    const savedComment = await comment.save();

    // Ajouter le commentaire au produit
    await Product.findByIdAndUpdate(productId, {
      $push: { comments: savedComment._id },
    });

    return res.status(201).json({
      message: 'Commentaire ajouté avec succès',
      comment: savedComment,
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire :', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Récupérer tous les commentaires d'un produit donné
 */
exports.getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const comments = await Comment.find({ product: productId })
      .populate('user', 'name') // Récupérer le nom de l'utilisateur
      .sort({ createdAt: -1 });

    return res.status(200).json({ comments });
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires :', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};