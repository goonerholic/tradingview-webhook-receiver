import mongoose from 'mongoose';

const ordersSchema = mongoose.Schema({
  symbol: { type: String, required: true },
  timestamp: { type: String, required: true },
  orderID: { type: String, required: true },
  orderQty: { type: Number },
  side: { type: String },
  price: { type: Number },
  ordType: { type: String },
  ordStatus: { type: String },
  text: { type: String, required: true },
});

ordersSchema.statics.create = function(arr) {
  return this.insertMany(arr);
};

ordersSchema.statics.findBySymbol = function(symbol, text) {
  return this.find({ symbol, text }).sort({ timestamp: -1 });
};

ordersSchema.statics.findByOrderID = function(symbol, orderID) {
  return this.find({ symbol, orderID });
};

const Order = mongoose.model('Order', ordersSchema);
export default Order;
