const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [255, 'Title cannot exceed 255 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
      trim: true
    },
    author: {
      type: String,
      required: true,
      default: 'Anonymous',
      trim: true
    },
    votes: {
      type: Number,
      default: 0,
      min: 0
    },
    answered: {
      type: Boolean,
      default: false
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reply'
    }],
    replyCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
postSchema.index({ votes: -1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ title: 'text', content: 'text' });

// Virtual for formatted date
postSchema.virtual('formattedDate').get(function() {
  const diff = Date.now() - this.createdAt.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
});

// Update reply count when replies are added
postSchema.methods.updateReplyCount = async function() {
  this.replyCount = this.replies.length;
  await this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;