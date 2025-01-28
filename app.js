const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const productRoutes = require('./routes/product.route');
const userRoutes = require('./routes/user.route');
const orderRoutes = require('./routes/order.route');
const commentRoutes = require('./routes/comment.routes');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.get('/', (req, res) => {
  res.send('Hello from Node');
});

const port = process.env.PORT || 8008;

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Middlewares
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1', commentRoutes);

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log('DB Error: ' + err));

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});