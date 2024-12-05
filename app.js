const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const userRoutes = require('./routes/user.route');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// const expressValidator = require('express-validator');

app.get('/', (req, res) => {
  res.send('Hello from Node');
});

const port = process.env.PORT || 8008;

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
// app.use(expressValidator());

// Middlewares
app.use('/api/v1/users', userRoutes);

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log('DB Error: ' + err));

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});