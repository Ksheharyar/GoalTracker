const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: true,
      index: true,
    },
    sessionDate: {
      type: String,
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    stoppedAt: {
      type: Date,
      required: true,
    },
    durationSeconds: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'saved'],
      default: 'saved',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    autosaveKey: {
      type: String,
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1, goalId: 1, sessionDate: 1 });
sessionSchema.index({ userId: 1, autosaveKey: 1 }, { unique: true, sparse: true });

sessionSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Session', sessionSchema);