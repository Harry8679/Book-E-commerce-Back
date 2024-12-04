const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('Hello from Node');
});

const port = process.env.PORT || 8008;

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log('DB Error: ' + err));

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});