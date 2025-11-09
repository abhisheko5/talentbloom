const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Please provide reply content'],
      trim: true
    },
    author: {
      type: String,
      required: true,
      default: 'Anonymous',
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted date
replySchema.virtual('formattedDate').get(function() {
  const diff = Date.now() - this.createdAt.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
});

// Index for faster queries
replySchema.index({ postId: 1, createdAt: 1 });

const Reply = mongoose.model('Reply', replySchema);

module.exports = Reply;