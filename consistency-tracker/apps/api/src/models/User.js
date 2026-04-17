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
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null,
    },
    authVersion: {
      type: Number,
      default: 0,
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
    delete ret.emailVerificationTokenHash;
    delete ret.emailVerificationTokenExpiresAt;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetTokenExpiresAt;
    delete ret.authVersion;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);