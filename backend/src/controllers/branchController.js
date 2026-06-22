import Branch from "../models/Branch.js";
import { validationResult } from "express-validator";

const buildBranchResponse = (branch) => ({
  id: branch._id,
  name: branch.name,
  code: branch.code,
  address: branch.address,
  phone: branch.phone,
  status: branch.status,
  createdAt: branch.createdAt,
  updatedAt: branch.updatedAt,
});

const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  return null;
};

export const listBranches = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { status, name, code, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (name) filter.name = { $regex: name, $options: "i" };
    if (code) filter.code = { $regex: code, $options: "i" };

    const [branches, total] = await Promise.all([
      Branch.find(filter)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .sort({ createdAt: -1 }),
      Branch.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: "Branches retrieved successfully.",
      data: branches.map(buildBranchResponse),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBranch = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { branchId } = req.params;
    const branch = await Branch.findById(branchId);

    if (!branch || branch.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Branch not found.",
        errors: [],
      });
    }

    res.json({
      success: true,
      message: "Branch retrieved successfully.",
      data: buildBranchResponse(branch),
    });
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { name, code, address = "", phone = "", status = "active" } = req.body;

    const existingBranch = await Branch.findOne({ $or: [{ name }, { code }] });
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: "Branch name or code already exists.",
        errors: [],
      });
    }

    const branch = new Branch({
      name,
      code,
      address,
      phone,
      status,
    });

    await branch.save();

    res.status(201).json({
      success: true,
      message: "Branch created successfully.",
      data: buildBranchResponse(branch),
    });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { branchId } = req.params;
    const { name, code, address, phone, status } = req.body;

    const branch = await Branch.findById(branchId);
    if (!branch || branch.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Branch not found.",
        errors: [],
      });
    }

    if (code && code !== branch.code) {
      const existingBranch = await Branch.findOne({ code });
      if (existingBranch) {
        return res.status(400).json({
          success: false,
          message: "Branch code already exists.",
          errors: [],
        });
      }
    }

    if (name && name !== branch.name) {
      const existingBranch = await Branch.findOne({ name });
      if (existingBranch) {
        return res.status(400).json({
          success: false,
          message: "Branch name already exists.",
          errors: [],
        });
      }
    }

    if (name !== undefined) branch.name = name;
    if (code !== undefined) branch.code = code;
    if (address !== undefined) branch.address = address;
    if (phone !== undefined) branch.phone = phone;
    if (status !== undefined) branch.status = status;

    await branch.save();

    res.json({
      success: true,
      message: "Branch updated successfully.",
      data: buildBranchResponse(branch),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req, res, next) => {
  try {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    const { branchId } = req.params;
    const branch = await Branch.findById(branchId);

    if (!branch || branch.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Branch not found.",
        errors: [],
      });
    }

    branch.isDeleted = true;
    branch.status = "deleted";
    await branch.save();

    res.json({
      success: true,
      message: "Branch deleted successfully.",
      data: buildBranchResponse(branch),
    });
  } catch (error) {
    next(error);
  }
};
