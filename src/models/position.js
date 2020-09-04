import mongoose from 'mongoose';

const { Schema } = mongoose;

const positionSchema = new Schema({
  symbol: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isOpen: { type: Boolean },
  currentQty: { type: Number },
  avgEntryPrice: { type: Number },
});

positionSchema.statics.create = function(arr) {
  return this.insertMany(arr);
};

positionSchema.statics.findBySymbol = function(symbol) {
  return this.find({ symbol }).sort({ timestamp: -1 });
};

const Position = mongoose.model('Position', positionSchema);
export default Position;
