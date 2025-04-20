const { User, Post, Comment, Place } = require('../models');
const { AuthenticationError, ApolloError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('posts')
          .populate('friends')
          .populate('savedPlaces');
        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('posts')
        .populate('friends')
        .populate('savedPlaces');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        .populate('posts')
        .populate('friends')
        .populate('savedPlaces');
    },
    posts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Post.find(params)
        .sort({ createdAt: -1 })
        .populate('comments')
        .populate('author');
    },
    post: async (parent, { _id }) => {
      try {
        const post = await Post.findOne({ _id })
          .populate('comments')
          .populate('author');
        if (post) {
          return post;
        } else {
          throw new ApolloError('Post not found', 'POST_NOT_FOUND');
        }
      } catch (err) {
        throw new ApolloError('Error fetching post: ' + err.message, 'FETCH_ERROR');
      }
    },
  },
  Mutation: {
    addUser: async (parent, args) => {
      try {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      } catch (error) {
        if (error.code === 11000) {
          if (error.keyPattern.username) {
            throw new ApolloError('A user with this username already exists', 'DUPLICATE_USERNAME');
          }
          if (error.keyPattern.email) {
            throw new ApolloError('A user with this email already exists', 'DUPLICATE_EMAIL');
          }
        }
        throw new ApolloError('Error creating user: ' + error.message, 'CREATE_USER_ERROR');
      }
    },
    
    addComment: async (parent, { postId, commentBody }, context) => {
      console.log("Authenticated User:", context.user); // Debugging

      if (!context.user) {
        throw new AuthenticationError('You need to be logged in');
      }

      const post = await Post.findById(postId);
      console.log("Post Found:", post); // Debugging

      if (!post) {
        throw new ApolloError('Post not found', 'POST_NOT_FOUND');
      }

      try {
        const comment = await Comment.create({
          commentBody,
          username: context.user.username,
          post: postId,
          author: context.user._id,
        });

        console.log("New Comment Created:", comment); // Debugging

        await Post.findByIdAndUpdate(
          postId,
          { $push: { comments: comment._id } },
          { new: true, useFindAndModify: false }
        );

        const updatedPost = await Post.findById(postId).populate('comments');
        console.log("Updated Post with Comments:", updatedPost); // Debugging

        return comment;
      } catch (err) {
        throw new ApolloError('Error adding comment: ' + err.message, 'COMMENT_ERROR');
      }
    },

    deleteComment: async (parent, { postId, commentId }, context) => {
      if (context.user) {
        const comment = await Comment.findById(commentId);
        if (!comment) {
          throw new ApolloError('Comment not found', 'COMMENT_NOT_FOUND');
        }
        if (comment.author.toString() !== context.user._id) {
          throw new AuthenticationError('You do not have permission to delete this comment');
        }
        await comment.deleteOne();
        await Post.findByIdAndUpdate(
          { _id: postId },
          { $pull: { comments: commentId } },
          { new: true }
        );
        return 'Comment successfully deleted';
      }
      throw new AuthenticationError('You need to be logged in');
    },

    addPost: async (parent, args, context) => {
      if (context.user) {
        const post = await Post.create({ ...args, username: context.user.username, author: context.user._id });
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $push: { posts: post._id } },
          { new: true }
        );
        return post;
      }
      throw new AuthenticationError('You need to be logged in');
    },

    deletePost: async (parent, { postId }, context) => {
      if (context.user) {
        const post = await Post.findById(postId);
        if (!post) {
          throw new ApolloError('Post not found', 'POST_NOT_FOUND');
        }
        if (post.author.toString() !== context.user._id) {
          throw new AuthenticationError('You do not have permission to delete this post');
        }
        await post.deleteOne();
        await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { posts: postId } },
          { new: true }
        );
        return 'Post successfully deleted';
      }
      throw new AuthenticationError('You need to be logged in');
    },

    likePost: async (parent, { postId }, context) => {
      if (context.user) {
        const post = await Post.findById(postId);
        if (!post) {
          throw new ApolloError('Post not found', 'POST_NOT_FOUND');
        }
        if (post.likes.find((like) => like.username === context.user.username)) {
          post.likes = post.likes.filter((like) => like.username !== context.user.username);
        } else {
          post.likes.push({
            username: context.user.username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      }
      throw new AuthenticationError('You need to be logged in');
    },
  },
};

module.exports = resolvers;
