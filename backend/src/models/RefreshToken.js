import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    absoluteExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    createdByIp: {
      type: String,
      default: null,
    },
    revokedByIp: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expiresAt.getTime();
});

refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revokedAt && Date.now() < this.expiresAt.getTime() && Date.now() < this.absoluteExpiresAt.getTime();
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
export default RefreshToken;
