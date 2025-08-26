const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ENV
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/react_bank';
const PORT = process.env.PORT || 5000;
const ADMIN_LOGIN = process.env.ADMIN_LOGIN;
const ADMIN_KEY = process.env.ADMIN_KEY;

// MongoDB connection 
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected');
    await ensureDefaults();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

const CalculatorSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },   // уникальный ID (mortgage_123abc)
  systemKey: { type: String, required: true },           // mortgage | auto | consumer | pension | business | ...
  name: { type: String, required: true },
  annualRate: { type: Number, default: 0 },              // годовая ставка, %
  createdAt: { type: Date, default: Date.now }
});

const Calculator = mongoose.model('Calculator', CalculatorSchema);

async function ensureDefaults() {
  const defaults = [
    { key: 'mortgage_default', systemKey: 'mortgage', name: 'Ипотека', annualRate: 9.6 },
    { key: 'auto_default', systemKey: 'auto', name: 'Автокредит', annualRate: 3.5 },
    { key: 'consumer_default', systemKey: 'consumer', name: 'Потребительский кредит', annualRate: 14.5 },
    { key: 'pension_default', systemKey: 'pension', name: 'Пенсионные накопления', annualRate: 7.0 }
  ];
  for (const def of defaults) {
    const exists = await Calculator.findOne({ systemKey: def.systemKey });
    if (!exists) {
      await Calculator.create(def);
    }
  }
}

// аутентификация: логин и токен
app.post('/api/login', (req, res) => {
  const { login, key } = req.body || {};
  if (login === ADMIN_LOGIN && key === ADMIN_KEY) {
    return res.json({ success: true, token: 'admintoken' });
  }
  return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
});

function checkAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (token === 'admintoken') return next();
  return res.status(403).json({ error: 'Forbidden' });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get('/api/calculators', async (req, res) => {
  try {
    const list = await Calculator.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// создать новый калькулятор
app.post('/api/calculators', async (req, res) => {
  try {
    const { name, annualRate, systemKey } = req.body;

    if (!systemKey) {
      return res.status(400).json({ error: 'systemKey is required' });
    }

    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const key = `${systemKey}_${Date.now()}_${uniqueSuffix}`;

    const created = await Calculator.create({
      key,
      name,
      annualRate,
      systemKey
    });

    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// обновление
app.put('/api/calculators/:id', checkAuth, async (req, res) => {
  try {
    const updated = await Calculator.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    return res.json(updated);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// удаление
app.delete('/api/calculators/:id', checkAuth, async (req, res) => {
  try {
    const deleted = await Calculator.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post('/api/compute/loan', (req, res) => {
  try {
    const { amount, annualRatePercent, years } = req.body || {};
    const monthlyRate = (annualRatePercent / 12) / 100;
    const months = years * 12;
    const totalFactor = Math.pow(1 + monthlyRate, months);
    const monthlyPayment = (amount * monthlyRate * totalFactor) / (totalFactor - 1);
    const totalPayment = monthlyPayment * months;
    res.json({
      monthlyRate,
      months,
      totalFactor,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/compute/pension', (req, res) => {
  try {
    const { monthlyContribution, years, annualRatePercent, initial } = req.body || {};
    const r = (annualRatePercent / 12) / 100;
    const n = years * 12;
    const fvContrib = monthlyContribution * ((Math.pow(1 + r, n) - 1) / r);
    const fvInitial = initial * Math.pow(1 + r, n);
    const total = fvContrib + fvInitial;
    res.json({
      monthlyRate: r,
      months: n,
      futureValue: Math.round(total * 100) / 100
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
