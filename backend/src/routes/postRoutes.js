const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPost,
  addReply,
  upvotePost,
  markAsAnswered,
  deletePost
} = require('../controllers/postController');

// Post routes
router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .get(getPost)
  .delete(deletePost);

router.post('/:id/reply', addReply);
router.post('/:id/upvote', upvotePost);
router.post('/:id/answered', markAsAnswered);

module.exports = router;