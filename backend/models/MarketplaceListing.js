const mongoose = require("mongoose");

const MarketplaceListingSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    accountPassword: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    game: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    yearsActive: {
      type: String,
      required: true,
      trim: true,
    },
    rank: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountRatingScore: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountRatingTier: {
      type: String,
      default: "D",
      trim: true,
    },
    accountRatingLabel: {
      type: String,
      default: "Starter",
      trim: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    soldAt: {
      type: Date,
      default: null,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("MarketplaceListing", MarketplaceListingSchema);
