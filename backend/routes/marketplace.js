const express = require("express");
const MarketplaceListing = require("../models/MarketplaceListing");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const { getAccountRanking } = require("../utils/marketplaceRanking");
const {
  authenticateToken,
  attachUserIfPresent,
} = require("../middleware/auth");

const router = express.Router();
const SELLABLE_GAMES = new Set([
  "Valorant",
  "Counter-Strike 2",
  "League of Legends",
  "Apex Legends",
  "Genshin Impact",
  "Fortnite",
]);

router.get("/listings", attachUserIfPresent, async (req, res) => {
  try {
    const listings = await MarketplaceListing.find().sort({
      isSold: 1,
      isActive: -1,
      createdAt: 1,
      accountId: 1,
    });

    let likedListingIds = [];

    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("likedListings");
      likedListingIds = (user?.likedListings || []).map((id) => id.toString());
    }

    res.json(
      listings.map((listing) => ({
        id: listing._id,
        accountId: listing.accountId,
        image: listing.image,
        text: `${listing.game} - $${listing.price}`,
        game: listing.game,
        price: listing.price,
        yearsActive: listing.yearsActive,
        rank: listing.rank,
        isActive: listing.isActive,
        isSold: listing.isSold,
        soldAt: listing.soldAt,
        description: listing.description,
        likesCount: listing.likesCount,
        accountRatingScore: listing.accountRatingScore,
        accountRatingTier: listing.accountRatingTier,
        accountRatingLabel: listing.accountRatingLabel,
        liked: likedListingIds.includes(listing._id.toString()),
        status: listing.isSold ? "Sold" : listing.isActive ? "Active" : "Inactive",
      })),
    );
  } catch (error) {
    console.error("Marketplace listings error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
});

router.get("/listings/:id", attachUserIfPresent, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findOne({
      _id: req.params.id,
      isSold: { $ne: true },
    });
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    let liked = false;

    if (req.user?.id) {
      const user = await User.findById(req.user.id).select("likedListings");
      liked = (user?.likedListings || []).some(
        (id) => id.toString() === listing._id.toString(),
      );
    }

    res.json({
      id: listing._id,
      accountId: listing.accountId,
      image: listing.image,
      text: `${listing.game} - $${listing.price}`,
      game: listing.game,
      price: listing.price,
      yearsActive: listing.yearsActive,
      rank: listing.rank,
      isActive: listing.isActive,
      description: listing.description,
      likesCount: listing.likesCount,
      accountRatingScore: listing.accountRatingScore,
      accountRatingTier: listing.accountRatingTier,
      accountRatingLabel: listing.accountRatingLabel,
      liked,
    });
  } catch (error) {
    console.error("Marketplace listing detail error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
});

router.get("/my-listings", authenticateToken, async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({
      sellerId: req.user.id,
    }).sort({ createdAt: -1, accountId: 1 });

    res.json({
      listings: listings.map((listing) => ({
        id: listing._id,
        accountId: listing.accountId,
        image: listing.image,
        text: `${listing.game} - $${listing.price}`,
        game: listing.game,
        price: listing.price,
        yearsActive: listing.yearsActive,
        rank: listing.rank,
        isActive: listing.isActive,
        isSold: listing.isSold,
        soldAt: listing.soldAt,
        createdAt: listing.createdAt,
        description: listing.description,
        likesCount: listing.likesCount,
        accountRatingScore: listing.accountRatingScore,
        accountRatingTier: listing.accountRatingTier,
        accountRatingLabel: listing.accountRatingLabel,
        liked: false,
        status: listing.isSold ? "Sold" : listing.isActive ? "Active" : "Inactive",
      })),
    });
  } catch (error) {
    console.error("Marketplace my listings error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
});

router.post("/listings/:id/like", authenticateToken, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const listingId = listing._id.toString();
    const likedListings = user.likedListings || [];
    const alreadyLiked = likedListings.some(
      (id) => id.toString() === listingId,
    );

    if (alreadyLiked) {
      user.likedListings = likedListings.filter(
        (id) => id.toString() !== listingId,
      );
      listing.likesCount = Math.max(0, (listing.likesCount || 0) - 1);
    } else {
      user.likedListings = [...likedListings, listing._id];
      listing.likesCount = (listing.likesCount || 0) + 1;
    }

    Object.assign(listing, getAccountRanking(listing));

    await Promise.all([user.save(), listing.save()]);

    res.json({
      liked: !alreadyLiked,
      likesCount: listing.likesCount,
      accountRatingScore: listing.accountRatingScore,
      accountRatingTier: listing.accountRatingTier,
      accountRatingLabel: listing.accountRatingLabel,
      listingId: listing._id,
    });
  } catch (error) {
    console.error("Marketplace like error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
});

router.post("/listings/:id/purchase", authenticateToken, async (req, res) => {
  try {
    const listing = await MarketplaceListing.findById(req.params.id).select(
      "+accountPassword",
    );
    if (!listing) {
      return res.status(404).json({ msg: "Listing not found" });
    }

    if (!listing.isActive || listing.isSold) {
      return res.status(400).json({ msg: "This listing is currently unavailable" });
    }

    const purchase = await Purchase.create({
      userId: req.user.id,
      listingId: listing._id,
      accountId: listing.accountId,
      accountPassword: listing.accountPassword,
      price: listing.price,
      status: "initiated",
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { purchases: purchase._id },
    });

    listing.isActive = false;
    listing.isSold = true;
    listing.soldAt = new Date();
    listing.soldTo = req.user.id;
    await listing.save();

    await User.updateMany(
      { likedListings: listing._id },
      { $pull: { likedListings: listing._id } },
    );

    res.json({
      msg: "Purchase request created",
      purchase: {
        id: purchase._id,
        accountId: purchase.accountId,
        accountPassword: purchase.accountPassword,
        price: purchase.price,
        status: purchase.status,
        game: listing.game,
      },
    });
  } catch (error) {
    console.error("Marketplace purchase error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
});

router.post("/listings", authenticateToken, async (req, res) => {
  try {
    const {
      accountId,
      accountPassword,
      game,
      price,
      yearsActive,
      rank,
      description,
    } = req.body || {};

    const normalizedAccountId = String(accountId || "").trim().toUpperCase();
    const normalizedAccountPassword = String(accountPassword || "").trim();
    const normalizedGame = String(game || "").trim();
    const normalizedYearsActive = String(yearsActive || "").trim();
    const normalizedRank = String(rank || "").trim();
    const normalizedDescription = String(description || "").trim();
    const numericPrice = Number(price);

    if (
      !normalizedAccountId ||
      !normalizedAccountPassword ||
      !normalizedGame ||
      !normalizedYearsActive ||
      !normalizedRank ||
      !normalizedDescription ||
      !Number.isFinite(numericPrice)
    ) {
      return res.status(400).json({ msg: "Please complete all listing fields" });
    }

    if (!SELLABLE_GAMES.has(normalizedGame)) {
      return res.status(400).json({ msg: "Please choose a supported game" });
    }

    if (numericPrice <= 0) {
      return res.status(400).json({ msg: "Price must be greater than 0" });
    }

    const existingListing = await MarketplaceListing.findOne({
      accountId: normalizedAccountId,
    });

    if (existingListing) {
      return res
        .status(409)
        .json({ msg: "This account ID is already listed in the marketplace" });
    }

    const ranking = getAccountRanking({
      game: normalizedGame,
      price: numericPrice,
      yearsActive: normalizedYearsActive,
      rank: normalizedRank,
      isActive: true,
      description: normalizedDescription,
      likesCount: 0,
    });

    const listing = await MarketplaceListing.create({
      accountId: normalizedAccountId,
      accountPassword: normalizedAccountPassword,
      game: normalizedGame,
      price: numericPrice,
      yearsActive: normalizedYearsActive,
      rank: normalizedRank,
      isActive: true,
      description: normalizedDescription,
      image: `generated://${normalizedGame.toLowerCase().replace(/\s+/g, "-")}`,
      sellerId: req.user.id,
      ...ranking,
    });

    res.status(201).json({
      msg: "Listing created successfully",
      listing: {
        id: listing._id,
        accountId: listing.accountId,
        image: listing.image,
        text: `${listing.game} - $${listing.price}`,
        game: listing.game,
        price: listing.price,
        yearsActive: listing.yearsActive,
        rank: listing.rank,
        isActive: listing.isActive,
        description: listing.description,
        likesCount: listing.likesCount,
        accountRatingScore: listing.accountRatingScore,
        accountRatingTier: listing.accountRatingTier,
        accountRatingLabel: listing.accountRatingLabel,
        liked: false,
        isSold: listing.isSold,
        soldAt: listing.soldAt,
        createdAt: listing.createdAt,
        status: listing.isSold ? "Sold" : listing.isActive ? "Active" : "Inactive",
      },
    });
  } catch (error) {
    console.error("Marketplace create listing error:", error);
    res.status(500).json({ msg: "Server error", details: error.message });
  }
});

module.exports = router;
