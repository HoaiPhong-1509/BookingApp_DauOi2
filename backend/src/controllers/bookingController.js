import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Resource from '../models/Resource.js';

const canAccessBooking = (req, booking) => {
  if (req.user.role === 'admin') return true;
  return booking.branchId.toString() === req.user.branchId?.toString();
};

const populateBooking = (query) => {
  return query
    .populate('branchId', 'name code')
    .populate('resourceId', 'name code type capacity reservationStatus currentBookingId')
    .populate('createdBy', 'fullName email')
    .populate('cancelledBy', 'fullName email')
    .populate('checkedInBy', 'fullName email')
    .populate('noShowBy', 'fullName email');
};

export const getBookings = async (req, res) => {
  try {
    const { branchId, resourceId, status, search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };

    if (req.user.role !== 'admin') {
      filter.branchId = req.user.branchId;
    }
    if (branchId && req.user.role === 'admin') {
      filter.branchId = branchId;
    }
    if (resourceId) filter.resourceId = resourceId;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Booking.countDocuments(filter);
    const bookings = await populateBooking(Booking.find(filter))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await populateBooking(Booking.findOne({ _id: id, isDeleted: false }));

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canAccessBooking(req, booking)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking', error: error.message });
  }
};

export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { branchId, resourceId, customerName, customerPhone, guestCount, bookingTime, holdUntil, note } = req.body;
    const bookingDate = new Date(bookingTime);
    const bookingHoldUntil = holdUntil ? new Date(holdUntil) : new Date(bookingDate.getTime() + 30 * 60 * 1000);

    if (bookingDate < new Date()) {
      return res.status(400).json({ success: false, message: 'bookingTime cannot be in the past' });
    }
    if (bookingHoldUntil <= bookingDate) {
      return res.status(400).json({ success: false, message: 'holdUntil must be after bookingTime' });
    }

    if (req.user.role !== 'admin' && req.user.branchId?.toString() !== branchId) {
      return res.status(403).json({ success: false, message: 'You can only create bookings for your own branch' });
    }

    let newBooking;
    await session.withTransaction(async () => {
      const resource = await Resource.findOne({
        _id: resourceId,
        branchId,
        isDeleted: false,
        status: { $ne: 'inactive' },
        type: { $in: ['table', 'room'] },
        reservationStatus: 'available',
      }).session(session);

      if (!resource) {
        throw new Error('Resource is unavailable for booking');
      }

      const existingReserved = await Booking.findOne({
        resourceId,
        status: 'reserved',
        isDeleted: false,
      }).session(session);

      if (existingReserved) {
        throw new Error('Resource already has a reserved booking');
      }

      const [createdBooking] = await Booking.create(
        [
          {
            branchId,
            resourceId,
            customerName,
            customerPhone,
            guestCount,
            bookingTime: bookingDate,
            holdUntil: bookingHoldUntil,
            status: 'reserved',
            createdBy: req.user._id,
            note: note || '',
          },
        ],
        { session }
      );

      await Resource.findByIdAndUpdate(
        resourceId,
        {
          reservationStatus: 'reserved',
          currentBookingId: createdBooking._id,
        },
        { session }
      );

      newBooking = createdBooking;
    });

    newBooking = await populateBooking(Booking.findById(newBooking._id));

    res.status(201).json({ success: true, message: 'Booking created successfully', data: newBooking });
  } catch (error) {
    if (error.message === 'Resource is unavailable for booking' || error.message === 'Resource already has a reserved booking') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
  } finally {
    await session.endSession();
  }
};

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const booking = await Booking.findOne({ _id: id, isDeleted: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canAccessBooking(req, booking)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this booking' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ success: false, message: 'Only reserved bookings can be updated' });
    }

    if (updates.resourceId && updates.resourceId.toString() !== booking.resourceId.toString()) {
      return res.status(400).json({ success: false, message: 'Changing resource is not supported for existing booking' });
    }

    if (updates.branchId && updates.branchId.toString() !== booking.branchId.toString()) {
      return res.status(400).json({ success: false, message: 'Changing branch is not supported for existing booking' });
    }

    if (updates.bookingTime) {
      const newBookingTime = new Date(updates.bookingTime);
      if (newBookingTime < new Date()) {
        return res.status(400).json({ success: false, message: 'bookingTime cannot be in the past' });
      }
      booking.bookingTime = newBookingTime;
    }

    if (updates.holdUntil) {
      const newHoldUntil = new Date(updates.holdUntil);
      if (newHoldUntil <= booking.bookingTime) {
        return res.status(400).json({ success: false, message: 'holdUntil must be after bookingTime' });
      }
      booking.holdUntil = newHoldUntil;
    }

    if (updates.customerName !== undefined) booking.customerName = updates.customerName;
    if (updates.customerPhone !== undefined) booking.customerPhone = updates.customerPhone;
    if (updates.guestCount !== undefined) booking.guestCount = updates.guestCount;
    if (updates.note !== undefined) booking.note = updates.note;

    booking.updatedAt = new Date();
    await booking.save();

    const updatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(200).json({ success: true, message: 'Booking updated successfully', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update booking', error: error.message });
  }
};

const releaseResourceForBooking = async (bookingId, resourceId, session = null) => {
  return Resource.findOneAndUpdate(
    { _id: resourceId, currentBookingId: bookingId },
    { reservationStatus: 'available', currentBookingId: null },
    { new: true, session }
  );
};

export const checkInBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, isDeleted: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canAccessBooking(req, booking)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to check in this booking' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ success: false, message: 'Only reserved bookings can be checked in' });
    }

    await session.withTransaction(async () => {
      booking.status = 'checked_in';
      booking.checkedInAt = new Date();
      booking.checkedInBy = req.user._id;
      await booking.save({ session });

      await releaseResourceForBooking(booking._id, booking.resourceId, session);
    });

    const updatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(200).json({ success: true, message: 'Booking checked in successfully', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check in booking', error: error.message });
  } finally {
    await session.endSession();
  }
};

export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const booking = await Booking.findOne({ _id: id, isDeleted: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canAccessBooking(req, booking)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to cancel this booking' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ success: false, message: 'Only reserved bookings can be cancelled' });
    }

    await session.withTransaction(async () => {
      booking.status = 'cancelled';
      booking.cancelReason = cancelReason || '';
      booking.cancelledBy = req.user._id;
      booking.cancelledAt = new Date();
      await booking.save({ session });

      await releaseResourceForBooking(booking._id, booking.resourceId, session);
    });

    const updatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to cancel booking', error: error.message });
  } finally {
    await session.endSession();
  }
};

export const noShowBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const booking = await Booking.findOne({ _id: id, isDeleted: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (!canAccessBooking(req, booking)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to mark this booking as no-show' });
    }

    if (booking.status !== 'reserved') {
      return res.status(400).json({ success: false, message: 'Only reserved bookings can be marked as no-show' });
    }

    await session.withTransaction(async () => {
      booking.status = 'no_show';
      booking.noShowAt = new Date();
      booking.noShowBy = req.user._id;
      await booking.save({ session });

      await releaseResourceForBooking(booking._id, booking.resourceId, session);
    });

    const updatedBooking = await populateBooking(Booking.findById(booking._id));
    res.status(200).json({ success: true, message: 'Booking marked as no-show successfully', data: updatedBooking });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark booking as no-show', error: error.message });
  } finally {
    await session.endSession();
  }
};
