const Order = require('../models/order.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Créer une commande
exports.createOrder = async (req, res) => {
  try {
    const { products, totalPrice, paymentMethod } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products in the order' });
    }

    console.log(`📌 Création d'une commande pour l'utilisateur ${req.auth._id}`);

    const order = new Order({
      user: req.auth._id,
      products,
      totalPrice,
      paymentMethod,
    });

    const savedOrder = await order.save();
    return res.status(201).json({ message: 'Order created successfully', order: savedOrder });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Obtenir les commandes d'un utilisateur connecté
exports.getUserOrders = async (req, res) => {
  try {
    console.log("📌 Récupération des commandes de l'utilisateur:", req.auth._id);

    if (!req.auth || !req.auth._id) {
      return res.status(401).json({ message: "Utilisateur non authentifié." });
    }

    const orders = await Order.find({ user: req.auth._id })
      .populate('products.product', 'name price');

    console.log("📌 Commandes trouvées :", orders.length);
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    return res.status(500).json({ message: 'Erreur serveur', error: error.message });
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
// exports.getUserOrders = async (req, res) => {
//   try {
//     console.log("User ID:", req.auth._id);
//     const orders = await Order.find({ user: req.auth._id }).populate('products.product', 'name price');
//     console.log("Orders found:", orders);
//     return res.status(200).json({ orders });
//   } catch (error) {
//     console.error('Erreur lors de la récupération des commandes de l\'utilisateur :', error);
//     return res.status(500).json({ message: 'Erreur serveur', error: error.message });
//   }
// };

// exports.getUserOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.auth._id }).populate('products.product', 'name price');
//     return res.status(200).json({ orders });
//   } catch (error) {
//     console.error('Error fetching user orders:', error);
//     return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
//   }
// };

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
    const userIdFromAuth = req.auth._id; // L'ID de l'utilisateur connecté

    // Recherche de la commande par son ID
    const order = await Order.findById(orderId)
      .populate('user', 'name email') // Récupérer les informations de l'utilisateur
      .populate('products.product', 'name price'); // Récupérer les informations des produits

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Vérification que l'utilisateur connecté est celui qui a passé la commande
    if (!order.user || order.user._id.toString() !== userIdFromAuth.toString()) {
      return res.status(403).json({
        message: 'Access denied. This order does not belong to you.',
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

/*
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userIdFromAuth = req.auth._id; // L'ID de l'utilisateur connecté

    // Recherche de la commande par son ID
    const order = await Order.findById(orderId)
      .populate('user', 'name email') // Récupérer les informations de l'utilisateur
      .populate('products.product', 'name price'); // Récupérer les informations des produits

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Vérification que l'utilisateur connecté est celui qui a passé la commande
    if (order.user.toString() !== userIdFromAuth.toString()) {
      return res.status(403).json({
        message: 'Access denied. This order does not belong to you.',
      });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};
*/

exports.getOrderByIdForAdmin = async (req, res) => {
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

// Récupérer la dernière commande d'un utilisateur connecté
exports.getLastOrder = async (req, res) => {
  try {
    const lastOrder = await Order.findOne({ user: req.auth._id })
      .sort({ createdAt: -1 }) // Trier par la date de création, la plus récente en premier
      .populate('products.product', 'name price'); // Populer les informations des produits

    if (!lastOrder) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    return res.status(200).json({ order: lastOrder });
  } catch (error) {
    console.error('Error fetching the last order:', error);
    return res.status(500).json({ message: 'Failed to fetch the last order', error: error.message });
  }
};

exports.createPaypalOrder = async (req, res) => {
  const { amount } = req.body;

  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: amount, // Montant total
          },
        },
      ],
    });

    const order = await client.execute(request);
    res.status(200).json({ id: order.result.id });
  } catch (error) {
    console.error("Erreur PayPal :", error);
    res.status(500).json({ error: error.message });
  }
};

exports.capturePaypalOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await client.execute(request);
    res.status(200).json(capture.result);
  } catch (error) {
    console.error("Erreur de capture :", error);
    res.status(500).json({ error: error.message });
  }
};

exports.capturePayPalOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);
    res.status(200).json({ message: 'Paiement capturé avec succès', response: response.result });
  } catch (error) {
    console.error('Erreur lors de la capture du paiement PayPal :', error);
    res.status(500).json({ error: 'Erreur lors de la capture du paiement PayPal.' });
  }
};