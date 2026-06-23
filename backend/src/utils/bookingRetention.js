export const BOOKING_HISTORY_RETENTION_DAYS = 30;

export const BOOKING_HISTORY_RETENTION_MS =
  BOOKING_HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export const BOOKING_HISTORY_STATUSES = [
  'checked_in',
  'cancelled',
  'no_show',
];

export const getBookingHistoryExpiry = (historyStartedAt = new Date()) => {
  return new Date(historyStartedAt.getTime() + BOOKING_HISTORY_RETENTION_MS);
};
