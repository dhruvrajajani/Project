const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameTitle: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  totalValue: {
    type: Number,
    default: 0
  },
  skinRarityIndex: {
    type: Number,
    default: 0
  },
  rankPrestige: {
    type: Number,
    default: 0
  },
  playtimeValue: {
    type: Number,
    default: 0
  },
  collectionDepth: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);