// routes/blogs.js
const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', protect, upload.single('blogImage'), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Check for required fields
    if (!title || !description || !req.file) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create blog
    const blog = new Blog({
      title,
      description,
      image: req.file.filename,
      author: req.user.id
    });

    await blog.save();

    res.status(201).json(blog);
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'Server error during blog creation' });
  }
});

// @route   GET /api/blogs
// @desc    Get all blogs for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate('author', 'email profileImage');
    
    res.json(blogs);
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
});


// routes/blogs.js (continued from where it left off)
router.get('/:id', protect, async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id)
        .populate('author', 'email profileImage')
        .populate({
          path: 'comments',
          populate: {
            path: 'author',
            select: 'email profileImage'
          }
        });
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      res.json(blog);
    } catch (error) {
      console.error('Get single blog error:', error);
      res.status(500).json({ message: 'Server error while fetching blog' });
    }
  });
  
  // @route   PUT /api/blogs/:id
  // @desc    Update a blog
  // @access  Private
  router.put('/:id', protect, upload.single('blogImage'), async (req, res) => {
    try {
      const { title, description } = req.body;
      let blog = await Blog.findById(req.params.id);
      
      // Check if blog exists
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      // Check if user is blog owner
      if (blog.author.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized to update this blog' });
      }
      
      // Update fields
      blog.title = title || blog.title;
      blog.description = description || blog.description;
      if (req.file) {
        blog.image = req.file.filename;
      }
      
      await blog.save();
      
      res.json(blog);
    } catch (error) {
      console.error('Update blog error:', error);
      res.status(500).json({ message: 'Server error during blog update' });
    }
  });
  
  // @route   DELETE /api/blogs/:id
  // @desc    Delete a blog
  // @access  Private
  router.delete('/:id', protect, async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
  
      if (blog.author.toString() !== req.user.id) {
        return res.status(403).json({ message: 'User not authorized to delete this blog' });
      }
  
      // Delete associated comments
      await Comment.deleteMany({ blog: req.params.id });
  
      // Delete the blog
      await blog.deleteOne(); // use deleteOne instead of remove()
  
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Delete blog error:', error.message); // Log detailed error
      res.status(500).json({ message: 'Server error during blog deletion', error: error.message });
    }
  });
  
  
  // @route   GET /api/blogs/public
  // @desc    Get all public blogs
  // @access  Public
  router.get('/public', async (req, res) => {
    try {
      const blogs = await Blog.find()
        .sort({ createdAt: -1 })
        .populate('author', 'email profileImage');
      
      res.json(blogs);
    } catch (error) {
      console.error('Get public blogs error:', error);
      res.status(500).json({ message: 'Server error while fetching blogs' });
    }
  });
  
module.exports = router;
  