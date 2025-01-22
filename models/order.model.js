const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: 'User', // Référence à l'utilisateur qui passe la commande
      required: true,
    },
    products: [
      {
        product: {
          type: ObjectId,
          ref: 'Product', // Référence au produit commandé
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number, // Prix au moment de la commande
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'card'], // Méthode de paiement utilisée
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false, // Défini à `false` jusqu'à ce que le paiement soit confirmé
    },
    paidAt: {
      type: Date, // Date de paiement (si la commande est payée)
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending', // Statut de la commande
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);