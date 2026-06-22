import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import {
  listBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} from "../controllers/branchController.js";
import {
  listBranchesValidation,
  branchIdValidation,
  createBranchValidation,
  updateBranchValidation,
  deleteBranchValidation,
} from "../validators/branchValidator.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/", listBranchesValidation, listBranches);
router.get("/:branchId", branchIdValidation, getBranch);
router.post("/", createBranchValidation, createBranch);
router.patch("/:branchId", updateBranchValidation, updateBranch);
router.delete("/:branchId", deleteBranchValidation, deleteBranch);

export default router;
