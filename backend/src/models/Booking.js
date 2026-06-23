import mongoose from 'mongoose';
import {
  BOOKING_HISTORY_STATUSES,
  getBookingHistoryExpiry,
} from '../utils/bookingRetention.js';

const bookingSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'branchId is required'],
      index: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: [true, 'resourceId is required'],
      index: true,
    },

    customerName: {
      type: String,
      required: [true, 'customerName is required'],
      trim: true,
    },

    customerPhone: {
      type: String,
      trim: true,
      default: '',
    },

    guestCount: {
      type: Number,
      required: [true, 'guestCount is required'],
      min: [1, 'guestCount must be at least 1'],
    },

    bookingTime: {
      type: Date,
      required: [true, 'bookingTime is required'],
      index: true,
    },

    holdUntil: {
      type: Date,
      required: [true, 'holdUntil is required'],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ['reserved', 'checked_in', 'cancelled', 'no_show'],
        message: 'status must be reserved, checked_in, cancelled, or no_show',
      },
      default: 'reserved',
      index: true,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },

    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    cancelReason: {
      type: String,
      trim: true,
      default: '',
    },

    noShowAt: {
      type: Date,
      default: null,
    },

    noShowBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    note: {
      type: String,
      trim: true,
      default: '',
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // MongoDB TTL hard-deletes history after 30 days. Reserved bookings keep
    // this field null, so an active booking can never expire accidentally.
    historyExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ resourceId: 1, status: 1 });
bookingSchema.index({ branchId: 1, status: 1, bookingTime: 1 });
bookingSchema.index({ holdUntil: 1, status: 1 });
bookingSchema.index({ historyExpiresAt: 1 }, { expireAfterSeconds: 0 });

bookingSchema.pre('save', function setHistoryExpiry() {
  if (!this.isModified('status')) return;

  if (BOOKING_HISTORY_STATUSES.includes(this.status)) {
    if (!this.historyExpiresAt) {
      this.historyExpiresAt = getBookingHistoryExpiry();
    }
    return;
  }

  this.historyExpiresAt = null;
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
