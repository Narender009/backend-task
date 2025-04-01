// models/Blog.js
const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    image: {
      type: String,
      required: [true, 'Please provide an image']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for blog image URL
BlogSchema.virtual('imageUrl').get(function () {
  return `/uploads/${this.image}`;
});

// Virtual for comments
BlogSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog',
  options: { sort: { createdAt: -1 } }
});

module.exports = mongoose.model('Blog', BlogSchema);