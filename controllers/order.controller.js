const Order = require('../models/order.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const { products, totalPrice, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in the order' });
    }

    const order = new Order({
      user: req.auth._id,
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
      { isPaid: true, paidAt: Date.now(), status: 'Paid' },
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

// Obtenir les commandes d'un utilisateur connecté
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
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      payment_method_types: ['card'],
    });

    // Mettre à jour le statut de la commande après le paiement
    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      status: 'Paid',
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      message: 'Payment succeeded and order updated',
    });
  } catch (error) {
    console.error('Erreur Stripe :', error);
    return res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

// Obtenir une commande par son ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('products.product', 'name price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};