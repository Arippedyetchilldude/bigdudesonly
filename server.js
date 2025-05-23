const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for your frontend
app.use(cors());
app.use(express.json());

// In-memory storage for visitor count
let visitorCount = 0;

// Middleware to increment visitor count
app.use((req, res, next) => {
    if (req.path === '/api/verify' || req.path === '/api/visitors') {
        visitorCount++;
    }
    next();
});

// Get visitor count
app.get('/api/visitors', (req, res) => {
    res.json({ count: visitorCount });
});

// Fake image verification endpoint
app.post('/api/verify', async (req, res) => {
    // Simulate processing time
    const processingTime = Math.floor(Math.random() * (10000 - 4200) + 4200);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));

    res.json({
        success: false,
        message: 'You are too small, try again when you are big.',
        details: {
            height: 'insufficient',
            width: 'insufficient',
            overall: 'not big enough'
        },
        timestamp: new Date().toISOString(),
        requestId: 'BDV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        processingTime: processingTime / 1000
    });
});

app.listen(port, () => {
    console.log(`API server running at http://localhost:${port}`);
}); 