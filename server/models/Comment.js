const { Schema, model } = require('mongoose');
const moment = require('moment');

const commentSchema = new Schema({
  commentBody: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => moment(timestamp).fromNow(),
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Index for frequently queried fields
commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });

const Comment = model('Comment', commentSchema);
module.exports = Comment;