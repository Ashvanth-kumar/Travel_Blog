const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Must match an email address!'],
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  friends: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  location: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String,
    trim: true,
    default: 'https://images.unsplash.com/photo-1620750034602-1ad42e46b86b?ixlib=rb-4.0.3&auto=format&fit=crop&w=735&q=80',
    validate: {
      validator: function (value) {
        // Simplified and corrected URL validation regex
        return /^https?:\/\/[^\s/$.?#][^\s]*$/.test(value);
      },
      message: 'Invalid URL for avatar',
    },
  },
  savedPlaces: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Place',
    },
  ],
});

// Index for frequently queried fields
userSchema.index({ location: 1 });

// Virtual for friendCount
userSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

// Pre-save hook to normalize email and hash password
userSchema.pre('save', async function (next) {
  try {
    // Normalize email to lowercase
    if (this.isNew || this.isModified('email')) {
      this.email = this.email.toLowerCase();
    }

    // Hash password
    if (this.isNew || this.isModified('password')) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.isCorrectPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords: ' + error.message);
  }
};

const User = model('User', userSchema);
module.exports = User;