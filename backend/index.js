const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5201;

app.use(cors());
app.use(express.json());

// SSE Clients
let clients = [];

// API Routes
// SSE Endpoint
app.get('/api/events', (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };

  clients.push(newClient);

  // Send initial keep-alive or ping
  res.write(`data: ${JSON.stringify({ type: 'ping' })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Load/Save chests persistence
const DATA_FILE = path.join(__dirname, 'chests.json');

function loadChests() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading chests.json', e);
  }
  return [];
}

function saveChests(ids) {
  try {
    // Merge new IDs with existing ones, avoid duplicates
    const existing = loadChests();
    const unique = Array.from(new Set([...existing, ...ids]));
    fs.writeFileSync(DATA_FILE, JSON.stringify(unique, null, 2));
    return unique;
  } catch (e) {
    console.error('Error writing chests.json', e);
    return ids;
  }
}

// API Routes
// Get recent chests
app.get('/api/admin/recent', (req, res) => {
  const chests = loadChests();
  res.json({ ids: chests });
});

// Admin Endpoint to broadcast new chest
app.post('/api/admin/chests', (req, res) => {
  const { id, ids } = req.body;
  const chestsToAdd = ids || (id ? [id] : []);

  if (!chestsToAdd.length) {
    return res.status(400).json({ error: 'No chest id provided' });
  }

  // Save to persistence
  saveChests(chestsToAdd);

  // Broadcast to all connected clients
  clients.forEach(client => {
    client.res.write(`data: ${JSON.stringify({ type: 'new_chests', ids: chestsToAdd })}\n\n`);
  });

  return res.json({ success: true, broadcastedTo: clients.length });
});

// Proxy Handler Logic
const proxyHandler = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Missing url parameter');
  }

  // Basic security: only allow requests to pwdatabase.ru
  try {
    const targetUrl = new URL(url);
    if (!targetUrl.hostname.includes('pwdatabase.ru')) {
        return res.status(403).send('Forbidden: Only pwdatabase.ru is allowed');
    }
  } catch (e) {
      return res.status(400).send('Invalid URL');
  }

  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://pwdatabase.ru/',
      }
    });

    if (response.headers['content-type']) {
      res.set('Content-Type', response.headers['content-type']);
    }

    res.send(response.data);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    if (error.response) {
      res.status(error.response.status).send(error.response.statusText);
    } else {
      res.status(500).send('Error fetching URL');
    }
  }
};

// Routes
// 1. API Routes
// Support both /proxy (dev legacy) and /api/proxy (production)
app.get('/proxy', proxyHandler);
app.get('/api/proxy', proxyHandler);

// 2. Static Files (Frontend)
// Check multiple locations for resilience (Docker vs Local)
const localDist = path.join(__dirname, '../dist');
const dockerDist = path.join(__dirname, 'public');
let staticPath = null;

if (fs.existsSync(dockerDist)) {
    staticPath = dockerDist;
} else if (fs.existsSync(localDist)) {
    staticPath = localDist;
}

if (staticPath) {
    console.log(`Serving static files from: ${staticPath}`);
    app.use(express.static(staticPath));

    // SPA Fallback: for any other route, send index.html
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).send('Not Found');
        }
        res.sendFile(path.join(staticPath, 'index.html'));
    });
} else {
    console.log('No static files found. Running in API-only mode.');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
