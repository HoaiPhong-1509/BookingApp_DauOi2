import Booking from '../models/Booking.js';
import {
  BOOKING_HISTORY_RETENTION_MS,
  BOOKING_HISTORY_STATUSES,
} from '../utils/bookingRetention.js';

const getHistoryStartExpression = {
  $switch: {
    branches: [
      { case: { $eq: ['$status', 'checked_in'] }, then: { $ifNull: ['$checkedInAt', '$updatedAt'] } },
      { case: { $eq: ['$status', 'cancelled'] }, then: { $ifNull: ['$cancelledAt', '$updatedAt'] } },
      { case: { $eq: ['$status', 'no_show'] }, then: { $ifNull: ['$noShowAt', '$updatedAt'] } },
    ],
    default: '$updatedAt',
  },
};

// Assign an expiry to history created before the retention field was added.
const backfillHistoryExpiry = async () => {
  await Booking.updateMany(
    {
      status: { $in: BOOKING_HISTORY_STATUSES },
      historyExpiresAt: null,
    },
    [
      {
        $set: {
          historyExpiresAt: {
            $add: [
              { $ifNull: [getHistoryStartExpression, '$createdAt'] },
              BOOKING_HISTORY_RETENTION_MS,
            ],
          },
        },
      },
    ],
    { updatePipeline: true }
  );
};

const cleanupExpiredHistory = async () => {
  const result = await Booking.deleteMany({
    status: { $in: BOOKING_HISTORY_STATUSES },
    historyExpiresAt: { $lte: new Date() },
  });

  if (result.deletedCount > 0) {
    console.log(`Hard-deleted ${result.deletedCount} expired booking history record(s)`);
  }
};

export const startBookingHistoryCleanupJob = (intervalMs = 6 * 60 * 60 * 1000) => {
  const runCleanup = async () => {
    await backfillHistoryExpiry();
    await cleanupExpiredHistory();
  };

  runCleanup().catch((error) => {
    console.error('Booking history cleanup initialization failed:', error.message);
  });

  const timer = setInterval(() => {
    runCleanup().catch((error) => {
      console.error('Booking history cleanup failed:', error.message);
    });
  }, intervalMs);

  return () => clearInterval(timer);
};
