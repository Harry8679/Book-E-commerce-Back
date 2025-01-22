const Order = require('../models/order.model');

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const { products, totalPrice, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: 'No products in the order' });
    }

    const order = new Order({
      user: req.user._id, // Récupéré depuis le middleware d'authentification
      products,
      totalPrice,
      paymentMethod,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Mettre à jour l'état de la commande (paiement)
exports.updateOrderPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order payment:', error);
    res.status(500).json({ error: 'Failed to update order payment' });
  }
};

// Obtenir toutes les commandes d'un utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('products.product', 'name price');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};