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
  
  const popularId = getMostPopularChestId(globalStats);
  res.write(`data: ${JSON.stringify({ 
    type: 'stats_update', 
    count: globalStats.totalOpened,
    mostPopularChestId: popularId
  })}\n\n`);

  res.write(`data: ${JSON.stringify({ type: 'drops_update', items: recentDrops })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

// Load/Save chests persistence
const DATA_FILE = path.join(__dirname, 'chests.json');
const STATS_FILE = path.join(__dirname, 'stats.json');
const DROPS_FILE = path.join(__dirname, 'recent_drops.json');

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

function loadStats() {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf8');
      const parsed = JSON.parse(data);
      // Migration or Default structure
      if (!parsed.chestCounts) parsed.chestCounts = {};
      return parsed;
    }
  } catch (e) {
    console.error('Error reading stats.json', e);
  }
  return { totalOpened: 0, chestCounts: {} };
}

function loadDrops() {
  try {
    if (fs.existsSync(DROPS_FILE)) {
      const data = fs.readFileSync(DROPS_FILE, 'utf8');
      const drops = JSON.parse(data);
      
      // Backfill UIDs for legacy data
      let changed = false;
      const patched = drops.map(d => {
        if (!d.uid) {
            changed = true;
            return { ...d, uid: Date.now().toString(36) + Math.random().toString(36).substr(2) };
        }
        return d;
      });
      
      if (changed) {
          try {
             fs.writeFileSync(DROPS_FILE, JSON.stringify(patched, null, 2));
          } catch(err) {
             console.error('Error saving backfilled drops', err);
          }
      }
      return patched;
    }
  } catch (e) {
    console.error('Error reading recent_drops.json', e);
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

function saveStats(stats) {
  // Deprecated: use async loop
  statsDirty = true;
  broadcastStatsDirty = true;
}

function saveDrops(drops) {
  // Deprecated: use async loop
  dropsDirty = true;
  broadcastDropsDirty = true;
}

let globalStats = loadStats();
let recentDrops = loadDrops();

// Persistence & Broadcast Optimization
let statsDirty = false;
let dropsDirty = false;
let broadcastStatsDirty = false;
let broadcastDropsDirty = false;
let isSavingStats = false;
let isSavingDrops = false;

// Save to disk every 5 seconds if needed
setInterval(() => {
  if (statsDirty && !isSavingStats) {
    isSavingStats = true;
    // Snapshot to avoid race conditions during async write
    const data = JSON.stringify(globalStats, null, 2);
    fs.writeFile(STATS_FILE, data, (err) => {
      isSavingStats = false;
      if (err) console.error('Error writing stats.json', err);
      else statsDirty = false;
    });
  }

  if (dropsDirty && !isSavingDrops) {
    isSavingDrops = true;
    const data = JSON.stringify(recentDrops, null, 2);
    fs.writeFile(DROPS_FILE, data, (err) => {
      isSavingDrops = false;
      if (err) console.error('Error writing recent_drops.json', err);
      else dropsDirty = false;
    });
  }
}, 5000);

// Broadcast updates every 200ms
setInterval(() => {
  if (!broadcastStatsDirty && !broadcastDropsDirty) return;

  const popularId = getMostPopularChestId(globalStats);
  const statsMsg = broadcastStatsDirty ? `data: ${JSON.stringify({ 
    type: 'stats_update', 
    count: globalStats.totalOpened,
    mostPopularChestId: popularId
  })}\n\n` : null;

  const dropsMsg = broadcastDropsDirty ? `data: ${JSON.stringify({ 
    type: 'drops_update', 
    items: recentDrops 
  })}\n\n` : null;

  if (statsMsg || dropsMsg) {
    clients.forEach(client => {
      try {
        if (statsMsg) client.res.write(statsMsg);
        if (dropsMsg) client.res.write(dropsMsg);
      } catch (e) {
        console.error(`SSE Broadcast error for client ${client.id}:`, e.message);
        // Force close to trigger cleanup
        try { client.res.end(); } catch (err) { /* ignore */ }
      }
    });
  }

  broadcastStatsDirty = false;
  broadcastDropsDirty = false;
}, 200);

function getMostPopularChestId(stats) {
  if (!stats.chestCounts) return null;
  let max = -1;
  let maxId = null;
  for (const [id, count] of Object.entries(stats.chestCounts)) {
    if (count > max) {
      max = count;
      maxId = Number(id);
    }
  }
  return maxId;
}

// API Routes
app.get('/api/stats', (req, res) => {
  const popularId = getMostPopularChestId(globalStats);
  res.json({ ...globalStats, mostPopularChestId: popularId });
});

app.post('/api/stats/increment', (req, res) => {
  const { count, chestId } = req.body;
  const incrementBy = typeof count === 'number' ? count : 1;
  
  globalStats.totalOpened += incrementBy;
  
  if (chestId) {
    if (!globalStats.chestCounts) globalStats.chestCounts = {};
    const current = globalStats.chestCounts[chestId] || 0;
    globalStats.chestCounts[chestId] = current + incrementBy;
  }

  saveStats(globalStats);
  
  const popularId = getMostPopularChestId(globalStats);
  
  // Broadcast is handled by async loop now
  
  res.json({ success: true, count: globalStats.totalOpened, mostPopularChestId: popularId });
});

app.get('/api/drops', (req, res) => {
  res.json(recentDrops);
});

app.post('/api/drops', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid items' });
  }

  // Assign IDs to new items
  const newItems = items.map(item => ({
    ...item,
    uid: Date.now().toString(36) + Math.random().toString(36).substr(2)
  }));

  // Add new items to the front
  recentDrops = [...newItems, ...recentDrops].slice(0, 50); // Keep last 50
  saveDrops(recentDrops);

  // Broadcast is handled by async loop now

  res.json({ success: true, count: recentDrops.length });
});

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
