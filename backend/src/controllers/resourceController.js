import Resource from '../models/Resource.js';
import Booking from '../models/Booking.js';

// Get all resources with filters and pagination
export const getResources = async (req, res) => {
  try {
    const { branchId, type, status, search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = { isDeleted: false };

    if (req.user.role !== 'admin' && req.user.branchId) {
      filter.branchId = req.user.branchId;
    } else if (branchId) {
      filter.branchId = branchId;
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count
    const total = await Resource.countDocuments(filter);

    // Get resources
    const resources = await Resource.find(filter)
      .populate('branchId', 'name code')
      .populate('createdBy', 'fullName email')
      .populate('currentBookingId', 'customerName customerPhone guestCount bookingTime holdUntil note status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message,
    });
  }
};

// Get resource by ID
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findOne({ _id: id, isDeleted: false })
      .populate('branchId', 'name code')
      .populate('createdBy', 'fullName email')
      .populate('deletedBy', 'fullName email')
      .populate('currentBookingId', 'customerName customerPhone guestCount bookingTime holdUntil note status');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    if (req.user.role !== 'admin' && resource.branchId._id.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this resource',
      });
    }

    res.status(200).json({
      success: true,
      data: resource,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource',
      error: error.message,
    });
  }
};

// Create resource
export const createResource = async (req, res) => {
  try {
    const { branchId, name, code, type, capacity, description, status, locationLabel, layout } = req.body;

    if (req.user.role !== 'admin' && req.user.branchId?.toString() !== branchId) {
      return res.status(403).json({
        success: false,
        message: 'You can only create resources for your own branch',
      });
    }

    // Create new resource
    const resource = new Resource({
      branchId,
      name,
      code: code.toUpperCase(),
      type,
      capacity,
      description,
      status,
      locationLabel,
      layout,
      reservationStatus: type === 'obstacle' ? 'inactive' : 'available',
      createdBy: req.user._id,
    });

    await resource.save();
    await resource.populate('branchId', 'name code');
    await resource.populate('createdBy', 'fullName email');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource,
    });
  } catch (error) {
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Code already exists in this branch',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create resource',
      error: error.message,
    });
  }
};

// Update resource
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, type, capacity, description, status, locationLabel, layout } = req.body;

    const resource = await Resource.findOne({ _id: id, isDeleted: false });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Manager can only update resources in their branch
    if (req.user.role === 'manager' && resource.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this resource',
      });
    }

    // Update fields
    if (name !== undefined) resource.name = name;
    if (code !== undefined) resource.code = code.toUpperCase();
    if (type !== undefined) {
      resource.type = type;
      if (type === 'obstacle') {
        resource.capacity = 0;
        resource.reservationStatus = 'inactive';
        resource.currentBookingId = null;
      } else if (resource.type === 'obstacle' || resource.reservationStatus === 'inactive') {
        resource.reservationStatus = 'available';
      }
    }
    if (capacity !== undefined && resource.type !== 'obstacle') resource.capacity = capacity;
    if (description !== undefined) resource.description = description;
    if (status !== undefined) resource.status = status;
    if (locationLabel !== undefined) resource.locationLabel = locationLabel;
    if (layout !== undefined) resource.layout = layout;

    await resource.save();
    await resource.populate('branchId', 'name code');
    await resource.populate('createdBy', 'fullName email');

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: resource,
    });
  } catch (error) {
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Code already exists in this branch',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update resource',
      error: error.message,
    });
  }
};

// Delete resource
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findOne({ _id: id, isDeleted: false });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Manager can only delete resources in their branch
    if (req.user.role === 'manager' && resource.branchId.toString() !== req.user.branchId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this resource',
      });
    }

    // Check if resource has any bookings
    const hasBookings = await Booking.findOne({ resourceId: id });

    if (hasBookings) {
      // Soft delete if resource has bookings (preserve booking history)
      resource.isDeleted = true;
      resource.deletedAt = new Date();
      resource.deletedBy = req.user._id;
      await resource.save();

      return res.status(200).json({
        success: true,
        message: 'Resource soft deleted successfully (bookings preserved)',
        data: resource,
      });
    }

    // Hard delete if no bookings
    await Resource.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource',
      error: error.message,
    });
  }
};

// Get resources by branch (for employee to view on diagram)
export const getResourcesByBranch = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { type } = req.query;

    if (req.user.role !== 'admin' && req.user.branchId?.toString() !== branchId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view the resource map for your own branch',
      });
    }

    const filter = {
      branchId,
      isDeleted: false,
    };

    if (type) {
      filter.type = type;
    }

    const resources = await Resource.find(filter)
      .populate('branchId', 'name code')
      .populate('currentBookingId', 'customerName customerPhone guestCount bookingTime holdUntil note status')
      .sort({ code: 1 });

    res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message,
    });
  }
};
