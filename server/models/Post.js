const { Schema, model } = require('mongoose');
const moment = require('moment');

const postSchema = new Schema({
  postTitle: {
    type: String,
    required: 'You need to write a title!',
    trim: true,
  },
  postText: {
    type: String,
    required: 'You need to write something!',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => moment(timestamp).fromNow(),
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  likes: [
    {
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
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    immutable: true,
  },
});

// Virtuals for commentCount and likeCount
postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Index for frequently queried fields
postSchema.index({ username: 1 });
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });

const Post = model('Post', postSchema);
module.exports = Post;