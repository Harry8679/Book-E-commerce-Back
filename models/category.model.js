const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required'],
    maxlength: [32, 'Name cannot exceed 32 characters'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);