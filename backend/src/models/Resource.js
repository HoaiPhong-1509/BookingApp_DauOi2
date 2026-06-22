import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'branchId is required'],
      index: true,
    },

    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },

    code: {
      type: String,
      required: [true, 'code is required'],
      trim: true,
    },

    type: {
      type: String,
      enum: {
        values: ['table', 'room'],
        message: 'type must be either table or room',
      },
      required: [true, 'type is required'],
    },

    capacity: {
      type: Number,
      required: [true, 'capacity is required'],
      min: [1, 'capacity must be greater than 0'],
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    status: {
      type: String,
      enum: {
        values: ['active', 'maintenance', 'inactive'],
        message: 'status must be active, maintenance, or inactive',
      },
      default: 'active',
    },

    reservationStatus: {
      type: String,
      enum: {
        values: ['available', 'reserved', 'inactive'],
        message: 'reservationStatus must be available, reserved, or inactive',
      },
      default: 'available',
      index: true,
    },

    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
      index: true,
    },

    locationLabel: {
      type: String,
      trim: true,
      default: '',
    },

    layout: {
      floor: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      rotation: {
        type: Number,
        default: 0,
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index({ branchId: 1, code: 1 }, { unique: true, sparse: true });
resourceSchema.index({ branchId: 1, isDeleted: 1, status: 1, reservationStatus: 1 });
resourceSchema.index({ currentBookingId: 1 });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
