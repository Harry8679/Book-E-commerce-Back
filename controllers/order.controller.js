const Order = require('../models/order.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Import Stripe avec votre clé secrète

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const { products, totalPrice, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in the order' });
    }

    const order = new Order({
      user: req.auth._id, // Utilisez `req.auth` pour récupérer l'ID utilisateur
      products,
      totalPrice,
      paymentMethod,
    });

    const savedOrder = await order.save();
    return res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Mettre à jour le paiement d'une commande
exports.updateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { isPaid: true, paidAt: Date.now() },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ message: 'Order payment updated', order: updatedOrder });
  } catch (error) {
    console.error('Error updating payment:', error);
    return res.status(500).json({ message: 'Failed to update payment', error: error.message });
  }
};

// Obtenir toutes les commandes de l'utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.auth._id }).populate('products.product', 'name price');
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Créer un PaymentIntent Stripe
exports.paymentStripe = async (req, res) => {
  try {
    const { amount } = req.body; // Montant en centimes
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Montant en centimes
      currency: 'eur', // Devise
      payment_method_types: ['card'], // Méthodes de paiement autorisées
    });

    return res.status(200).json({ clientSecret: paymentIntent.client_secret }); // Retourner le clientSecret
  } catch (error) {
    console.error('Erreur Stripe :', error);
    return res.status(500).json({ message: 'Failed to create Stripe PaymentIntent', error: error.message });
  }
};

// Obtenir toutes les commandes (réservé aux admins)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email') // Populer les informations de l'utilisateur
      .populate('products.product', 'name price'); // Populer les informations des produits
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Récupérer une commande par son ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params; // Récupérer l'ID de la commande depuis les paramètres
    const order = await Order.findById(orderId)
      .populate('user', 'name email') // Populer les informations de l'utilisateur
      .populate('products.product', 'name price'); // Populer les informations des produits

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

