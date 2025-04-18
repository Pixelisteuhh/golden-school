const mongoose = require('mongoose');

const fumerSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  count: { type: Number, default: 0 },
});

const fumer = mongoose.model('fumer', fumerSchema);

module.exports = { fumer };