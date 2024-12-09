const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const productRoutes = require('./routes/product.route');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.get('/', (req, res) => {
  res.send('Hello from Node');
});

const port = process.env.PORT || 8008;

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Middlewares
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log('DB Error: ' + err));

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});