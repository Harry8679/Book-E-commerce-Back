const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required'],
    maxlength: [32, 'Name cannot exceed 32 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    trim: true,
    required: [true, 'Price is required'],
    maxlength: [32, 'Price cannot exceed 32 characters'],
  },
  category: {
    type: ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    maxlength: [32, 'Category cannot exceed 32 characters'],
  },
  quantity: {
    type: Number,
  },
  sold: {
    type: String,
    default: 0
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  shipping: {
    type: Boolean,
    required: [false, 'Category is required'],
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);