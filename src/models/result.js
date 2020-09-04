import mongoose from 'mongoose';

const { Schema } = mongoose;

const resultSchema = new Schema({
  symbol: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  total: { type: Number },
  won: { type: Number },
  lost: { type: Number },
  netPnl: { type: Number },
  walletBalance: { type: Number },
});

resultSchema.statics.create = function(arr) {
  return this.insertMany(arr);
};

resultSchema.statics.findBySymbol = function(symbol) {
  return this.find({ symbol }).sort({ timestamp: -1 });
};

const Result = mongoose.model('Result', resultSchema);
export default Result;
