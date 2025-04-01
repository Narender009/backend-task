// routes/comments.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { content, blogId } = req.body;

    // Check for required fields
    if (!content || !blogId) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Create comment
    const comment = new Comment({
      content,
      author: req.user.id,
      blog: blogId
    });

    await comment.save();

    // Populate author details before sending response
    await comment.populate('author', 'email profileImage');
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error during comment creation' });
  }
});

router.post('/:blogId/addcomments', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const { blogId } = req.params;

    // Check for required fields
    if (!content) {
      return res.status(400).json({ message: 'Please provide content for the comment' });
    }

    // Check if the blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Create the comment
    const comment = new Comment({
      content,
      author: req.user.id, // Assuming req.user contains the authenticated user's info
      blog: blogId
    });

    await comment.save();

    // Populate author details before sending response
    await comment.populate('author', 'email profileImage');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error during comment creation' });
  }
});

// @route   POST /api/comments/:commentId/replies
// @desc    Add a reply to a comment
// @access  Private
router.post('/:commentId/replies', protect, async (req, res) => {
  try {
    const { content } = req.body;

    // Check for required fields
    if (!content) {
      return res.status(400).json({ message: 'Please provide content for reply' });
    }

    // Find comment
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Add reply
    comment.replies.push({
      content,
      author: req.user.id
    });

    await comment.save();

    // Populate author details before sending response
    await comment.populate('author', 'email profileImage');
    await comment.populate('replies.author', 'email profileImage');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ message: 'Server error during reply creation' });
  }
});

// @route   GET /api/comments/blog/:blogId
// @desc    Get all comments for a blog
// @access  Public
router.get('/blog/:blogId', async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .sort({ createdAt: -1 })
      .populate('author', 'email profileImage')
      .populate('replies.author', 'email profileImage');
    
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { content } = req.body;
    let comment = await Comment.findById(req.params.id);
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is comment owner
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this comment' });
    }
    
    // Update content
    comment.content = content || comment.content;
    
    await comment.save();
    
    // Populate author details before sending response
    await comment
      .populate('author', 'email profileImage')
      .populate('replies.author', 'email profileImage')
      .execPopulate();
    
    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error during comment update' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is comment owner
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this comment' });
    }
    
    // Delete the comment
    await comment.remove();
    
    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error during comment deletion' });
  }
});

// @route   PUT /api/comments/:commentId/replies/:replyId
// @desc    Update a reply
// @access  Private
router.put('/:commentId/replies/:replyId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Find the reply
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user is reply owner
    if (reply.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to update this reply' });
    }
    
    // Update content
    reply.content = content || reply.content;
    
    await comment.save();
    
    // Populate author details before sending response
    await comment
      .populate('author', 'email profileImage')
      .populate('replies.author', 'email profileImage')
      .execPopulate();
    
    res.json(comment);
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({ message: 'Server error during reply update' });
  }
});

// @route   DELETE /api/comments/:commentId/replies/:replyId
// @desc    Delete a reply
// @access  Private
router.delete('/:commentId/replies/:replyId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    // Check if comment exists
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Find the reply
    const reply = comment.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }
    
    // Check if user is reply owner
    if (reply.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized to delete this reply' });
    }
    
    // Remove reply
    reply.remove();
    
    await comment.save();
    
    // Populate author details before sending response
    await comment
      .populate('author', 'email profileImage')
      .populate('replies.author', 'email profileImage')
      .execPopulate();
    
    res.json(comment);
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ message: 'Server error during reply deletion' });
  }
});

module.exports = router;