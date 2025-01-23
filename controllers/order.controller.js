const Order = require('../models/order.model'); // Assurez-vous d'importer votre modèle de commande
const Product = require('../models/product.model');

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    console.log('Req body:', req.body);
    console.log('Req auth:', req.auth); // Vérifiez si l'utilisateur est authentifié et si `req.auth` contient l'ID utilisateur

    const { products, totalPrice, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in the order' });
    }

    const order = new Order({
      user: req.auth._id, // Remplacez req.user par req.auth (défini dans requireSignin)
      products,
      totalPrice,
      paymentMethod,
    });

    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder);

    res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
    console.error('Error creating order:', error); // Log d'erreur détaillé
    res.status(500).json({ message: 'Failed to create order' });
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

    res.status(200).json({ message: 'Order payment updated', order: updatedOrder });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Failed to update payment' });
  }
};

// Obtenir toutes les commandes de l'utilisateur
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('products.product', 'name price');
    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.paymentStripe = async (req, res) => {
  const { amount } = req.body; // Montant en centimes (par exemple, 500 pour 5 €)
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Erreur Stripe :', error);
    res.status(500).json({ error: error.message });
  }
};