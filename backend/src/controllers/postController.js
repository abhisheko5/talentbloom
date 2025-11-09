const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const { validatePost, validateReply } = require('../utils/validation');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Public
const createPost = asyncHandler(async (req, res) => {
  const { title, content, author } = req.body;

  // Validate input
  const validation = validatePost({ title, content });
  if (!validation.isValid) {
    res.status(400);
    throw new Error(validation.errors.join(', '));
  }

  // Create post
  const post = await Post.create({
    title,
    content,
    author: author || 'Anonymous'
  });

  // Emit socket event
  req.io.emit('newPost', post);

  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const { search, sortBy = 'votes', page = 1, limit = 20 } = req.query;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort
  let sort = {};
  if (sortBy === 'votes') {
    sort = { votes: -1, createdAt: -1 };
  } else if (sortBy === 'date') {
    sort = { createdAt: -1 };
  }

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const posts = await Post.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await Post.countDocuments(query);

  res.json({
    success: true,
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single post with replies
// @route   GET /api/posts/:id
// @access  Public
const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'replies',
      options: { sort: { createdAt: 1 } }
    })
    .select('-__v');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.json({
    success: true,
    data: post
  });
});

// @desc    Add reply to post
// @route   POST /api/posts/:id/reply
// @access  Public
const addReply = asyncHandler(async (req, res) => {
  const { content, author } = req.body;
  const postId = req.params.id;

  // Validate input
  const validation = validateReply({ content });
  if (!validation.isValid) {
    res.status(400);
    throw new Error(validation.errors.join(', '));
  }

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Create reply
  const reply = await Reply.create({
    postId,
    content,
    author: author || 'Anonymous'
  });

  // Add reply to post
  post.replies.push(reply._id);
  await post.updateReplyCount();

  // Emit socket event
  req.io.emit('newReply', {
    postId,
    reply
  });

  res.status(201).json({
    success: true,
    data: reply
  });
});

// @desc    Upvote a post
// @route   POST /api/posts/:id/upvote
// @access  Public
const upvotePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.votes += 1;
  await post.save();

  // Emit socket event
  req.io.emit('postUpdated', post);

  res.json({
    success: true,
    data: post
  });
});

// @desc    Mark post as answered
// @route   POST /api/posts/:id/answered
// @access  Public
const markAsAnswered = asyncHandler(async (req, res) => {
  const { answered } = req.body;
  
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.answered = answered !== undefined ? answered : !post.answered;
  await post.save();

  // Emit socket event
  req.io.emit('postUpdated', post);

  res.json({
    success: true,
    data: post
  });
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Public
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Delete all replies associated with the post
  await Reply.deleteMany({ postId: post._id });

  // Delete the post
  await post.deleteOne();

  // Emit socket event
  req.io.emit('postDeleted', { postId: req.params.id });

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
});

module.exports = {
  createPost,
  getPosts,
  getPost,
  addReply,
  upvotePost,
  markAsAnswered,
  deletePost
};