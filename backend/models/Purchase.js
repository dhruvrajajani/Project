const mongoose = require("mongoose");

const PurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MarketplaceListing",
      required: true,
    },
    accountId: {
      type: String,
      required: true,
      trim: true,
    },
    accountPassword: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["initiated", "completed"],
      default: "initiated",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

PurchaseSchema.index({ userId: 1, listingId: 1, createdAt: -1 });

module.exports = mongoose.model("Purchase", PurchaseSchema);
