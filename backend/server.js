require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Models
const Account = require('./models/Account');
const MarketplaceListing = require("./models/MarketplaceListing");
const marketplaceSeed = require("./data/marketplaceSeed");
const { authenticateToken } = require("./middleware/auth");
const { getAccountRanking } = require("./utils/marketplaceRanking");

// Middleware
app.use(cors());
app.use(express.json());

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use("/api/marketplace", require("./routes/marketplace"));

// Routes
app.get('/', (req, res) => {
    res.send('Kinetic Vault API Running...');
});

// Dashboard data route
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get user's accounts
    const accounts = await Account.find({ userId: req.user.id });
    
    // Calculate dashboard stats
    const totalValue = accounts.reduce((sum, acc) => sum + acc.totalValue, 0);
    const activeSales = accounts.filter(acc => acc.totalValue > 0).length; // Simplified
    const credits = Math.floor(totalValue * 0.1); // Example calculation
    
    // Get recent activity (mock data for now)
    const recentActivity = [
      { id: 1, type: 'sale', description: 'Sold CS2 Global Elite Acc', timeAgo: '2 hours ago', amount: 840, status: 'success' },
      { id: 2, type: 'valuation', description: 'New Valuation: WoW Classic Lvl 80', timeAgo: '5 hours ago', amount: 215, status: 'info' },
      { id: 3, type: 'purchase', description: 'Purchased: League Smurf (Lvl 30)', timeAgo: 'Yesterday', amount: -45, status: 'success' }
    ];
    
    // Market insights (mock data)
    const marketInsights = [
      { id: 1, game: 'Valorant', item: 'Radiant', demand: 'Ultra High', change: '+18.2%', color: 'blue' },
      { id: 2, game: 'Apex Legends', item: 'Heirloom', demand: 'High', change: '+5.4%', color: 'red' }
    ];
    
    res.json({
      stats: { totalValue, activeSales, credits },
      recentActivity,
      marketInsights,
      accounts: accounts.map(acc => ({
        id: acc._id, gameTitle: acc.gameTitle, accountName: acc.accountName,
        totalValue: acc.totalValue, skinRarityIndex: acc.skinRarityIndex,
        rankPrestige: acc.rankPrestige, playtimeValue: acc.playtimeValue, collectionDepth: acc.collectionDepth
      }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Database connection
function createMarketplacePassword(accountId) {
  return `Vault@${String(accountId).replace(/[^A-Z0-9]/gi, '')}`;
}

async function seedMarketplaceListings() {
  const existingCount = await MarketplaceListing.countDocuments();
  if (existingCount === 0) {
    await MarketplaceListing.insertMany(
      marketplaceSeed.map((listing) => ({
        ...listing,
        accountPassword:
          listing.accountPassword || createMarketplacePassword(listing.accountId),
        ...getAccountRanking(listing),
      })),
    );
    console.log("Marketplace seed data inserted");
  }

  const existingListings = await MarketplaceListing.find().select(
    "_id accountId price yearsActive rank isActive description likesCount accountPassword accountRatingScore accountRatingTier accountRatingLabel",
  );

  const listingsNeedingBackfill = existingListings.filter(
    (listing) =>
      !listing.accountPassword ||
      !listing.accountRatingScore ||
      !listing.accountRatingTier ||
      !listing.accountRatingLabel,
  );

  if (listingsNeedingBackfill.length === 0) {
    return;
  }

  await MarketplaceListing.bulkWrite(
    listingsNeedingBackfill.map((listing) => ({
      updateOne: {
        filter: { _id: listing._id },
        update: {
          $set: {
            accountPassword: createMarketplacePassword(listing.accountId),
            ...getAccountRanking(listing),
          },
        },
      },
    })),
  );

  console.log(
    `Marketplace listing passwords and rankings backfilled for ${listingsNeedingBackfill.length} cards`,
  );
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    await seedMarketplaceListings();
  })
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
