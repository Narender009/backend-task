// models/Comment.js
const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please provide content for reply'],
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please provide content for comment'],
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: true
    },
    replies: [ReplySchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', CommentSchema);
