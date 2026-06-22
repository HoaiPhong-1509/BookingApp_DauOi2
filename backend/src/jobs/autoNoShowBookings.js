import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Resource from '../models/Resource.js';

const markExpiredBookings = async () => {
  const now = new Date();
  const bookings = await Booking.find({ status: 'reserved', isDeleted: false, holdUntil: { $lt: now } });

  if (!bookings.length) {
    return;
  }

  for (const booking of bookings) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        booking.status = 'no_show';
        booking.noShowAt = now;
        booking.noShowBy = null;
        await booking.save({ session });

        await Resource.findOneAndUpdate(
          { _id: booking.resourceId, currentBookingId: booking._id },
          { reservationStatus: 'available', currentBookingId: null },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  }
};

export const startAutoNoShowJob = (intervalMs = 60000) => {
  markExpiredBookings().catch((err) => {
    console.error('Auto no-show job initialization failed:', err.message);
  });

  const timer = setInterval(() => {
    markExpiredBookings().catch((err) => {
      console.error('Auto no-show job failed:', err.message);
    });
  }, intervalMs);

  return () => clearInterval(timer);
};
