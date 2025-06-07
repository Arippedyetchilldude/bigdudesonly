const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

// Use your Render PostgreSQL connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors());
app.use(express.json());

// Ensure a row exists
async function ensureRow() {
  await pool.query(
    'INSERT INTO visitor_stats (id, visits, successes, fails) VALUES (1, 0, 0, 0) ON CONFLICT (id) DO NOTHING'
  );
}

// Increment and get visitor count
app.get('/api/visitors', async (req, res) => {
  try {
    await ensureRow();
    const result = await pool.query(
      'UPDATE visitor_stats SET visits = visits + 1 WHERE id = 1 RETURNING visits'
    );
    res.json({ visits: result.rows[0].visits });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all stats
app.get('/api/stats', async (req, res) => {
  try {
    await ensureRow();
    const result = await pool.query('SELECT visits, successes, fails FROM visitor_stats WHERE id = 1');
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Fake image verification endpoint
app.post('/api/verify', async (req, res) => {
  // Simulate random processing steps and delays
  const steps = [
    'Analyzing Mass...',
    'Calculating Density...',
    'Verifying Volumen...'
  ];
  const processingTime = Math.floor(Math.random() * (10000 - 4200) + 4200);
  const stepTimes = [
    Math.floor(processingTime * 0.25),
    Math.floor(processingTime * 0.35),
    Math.floor(processingTime * 0.4)
  ];

  // Simulate step-by-step processing
  for (let i = 0; i < steps.length; i++) {
    await new Promise(resolve => setTimeout(resolve, stepTimes[i]));
  }

  await ensureRow();

  // 1% chance of success
  const isSuccess = Math.random() < 0.01;
  if (isSuccess) {
    await pool.query('UPDATE visitor_stats SET successes = successes + 1 WHERE id = 1');
    return res.json({
      success: true,
      message: 'nice dude',
      steps,
      timestamp: new Date().toISOString(),
      requestId: 'BDV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      processingTime: processingTime / 1000
    });
  } else {
    await pool.query('UPDATE visitor_stats SET fails = fails + 1 WHERE id = 1');
    return res.json({
      success: false,
      message: 'You are too small, try again when you are big.',
      details: {
        height: 'insufficient',
        width: 'insufficient',
        overall: 'not big enough'
      },
      steps,
      timestamp: new Date().toISOString(),
      requestId: 'BDV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      processingTime: processingTime / 1000
    });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
}); 