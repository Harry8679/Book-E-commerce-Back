const Order = require('../models/order.model');

exports.orderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id).populate('products.product', 'name price');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    req.order = order; // Ajoute la commande à la requête
    next();
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Could not fetch order' });
  }
};