const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    dailyTargetHours: {
      type: Number,
      required: true,
      min: 0.25,
      max: 24,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
      max: 3650,
    },
    startDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Goal', goalSchema);