/**
 * Validate post data
 */
const validatePost = ({ title, content }) => {
  const errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.length > 255) {
    errors.push('Title cannot exceed 255 characters');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  } else if (content.length < 10) {
    errors.push('Content must be at least 10 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate reply data
 */
const validateReply = ({ content }) => {
  const errors = [];

  if (!content || content.trim().length === 0) {
    errors.push('Reply content is required');
  } else if (content.length < 5) {
    errors.push('Reply must be at least 5 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  validatePost,
  validateReply,
  sanitizeString
};