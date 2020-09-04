import mongoose from 'mongoose';

const { Schema } = mongoose;

const signalSchema = new Schema({
  symbol: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  price: { type: Number },
  side: { type: String },
});

signalSchema.statics.create = function (arr) {
  return this.insertMany(arr);
};

signalSchema.statics.findBySymbol = function (symbol) {
  return this.find({ symbol }).sort({ timestamp: -1 });
};

const Signal = mongoose.model('Signal', signalSchema);
export default Signal;
