const mongoose = require('mongoose');

const CalculatorSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  systemKey: { type: String, required: true }, // mortgage | auto | consumer | pension | ...
  name: { type: String, required: true },
  annualRate: { type: Number, required: true }
});

module.exports = mongoose.model('Calculator', CalculatorSchema);
