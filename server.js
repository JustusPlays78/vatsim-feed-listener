const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// CORS für alle Requests aktivieren
app.use(cors());

// JSON parsing
app.use(express.json());

// Statische Dateien servieren
app.use(express.static(path.join(__dirname, 'public')));

// Proxy Route für STATSIM API
app.get('/api/flights', async (req, res) => {
    try {
        const { icao, from, to } = req.query;
        
        // Validierung
        if (!icao || !from || !to) {
            return res.status(400).json({ 
                error: 'Missing required parameters: icao, from, to' 
            });
        }

        // URL für STATSIM API
        const apiUrl = `https://api.statsim.net/api/Flights/IcaoDestination?icao=${icao}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        
        console.log(`Fetching: ${apiUrl}`);
        
        // API-Aufruf
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'VATSIM-Flight-Analyzer/1.0',
                'Accept': 'application/json',
            },
            timeout: 30000
        });

        if (!response.ok) {
            console.error(`STATSIM API Error: ${response.status} ${response.statusText}`);
            return res.status(response.status).json({ 
                error: `API Error: ${response.status} ${response.statusText}` 
            });
        }

        const data = await response.json();
        
        // Erfolgreiche Antwort
        res.json(data);
        
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback für SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`🚀 VATSIM Flight Analyzer running on port ${port}`);
    console.log(`📡 Proxy endpoint: /api/flights`);
    console.log(`🌐 Frontend: http://localhost:${port}`);
});