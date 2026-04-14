const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    reminderTime: {
      type: String,
      default: '20:00',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);