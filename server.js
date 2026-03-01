const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'carcompany-hackathon-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
// Ensure database directory exists
const dbDir = './database';
if (!require('fs').existsSync(dbDir)) {
    require('fs').mkdirSync(dbDir);
}

const db = new sqlite3.Database('./database/vehicle_identity.db');

// Initialize database tables
db.serialize(() => {
  // Vehicles table
  db.run(`CREATE TABLE IF NOT EXISTS vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT UNIQUE NOT NULL,
    vin TEXT UNIQUE NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    engine_number TEXT,
    chassis_number TEXT,
    registration_date DATE,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Owners table
  db.run(`CREATE TABLE IF NOT EXISTS owners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    id_proof_type TEXT,
    id_proof_number TEXT,
    date_of_birth DATE,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Vehicle-Owner relationship table
  db.run(`CREATE TABLE IF NOT EXISTS vehicle_ownership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    ownership_start_date DATE NOT NULL,
    ownership_end_date DATE,
    ownership_type TEXT DEFAULT 'primary',
    is_current BOOLEAN DEFAULT 1,
    transfer_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (owner_id) REFERENCES owners(owner_id)
  )`);

  // Insurance table
  db.run(`CREATE TABLE IF NOT EXISTS insurance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    insurance_id TEXT UNIQUE NOT NULL,
    vehicle_id TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    insurance_type TEXT NOT NULL,
    coverage_amount REAL NOT NULL,
    premium_amount REAL NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
  )`);

  // Authorization logs table
  db.run(`CREATE TABLE IF NOT EXISTS authorization_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id TEXT NOT NULL,
    platform_id TEXT NOT NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id)
  )`);

  console.log('✅ Database tables initialized');
});

// ==================== VEHICLE ROUTES ====================

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
  const query = `
    SELECT v.*, o.first_name || ' ' || o.last_name as owner_name, o.owner_id
    FROM vehicles v
    LEFT JOIN vehicle_ownership vo ON v.vehicle_id = vo.vehicle_id AND vo.is_current = 1
    LEFT JOIN owners o ON vo.owner_id = o.owner_id
    ORDER BY v.created_at DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ vehicles: rows });
  });
});

// Get vehicle by ID
app.get('/api/vehicles/:vehicleId', (req, res) => {
  const { vehicleId } = req.params;

  db.get(`SELECT * FROM vehicles WHERE vehicle_id = ?`, [vehicleId], (err, vehicle) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    db.all('SELECT * FROM insurance WHERE vehicle_id = ?', [vehicleId], (err, insurance) => {
      if (err) return res.status(500).json({ error: err.message });

      db.all(`
        SELECT vo.*, o.first_name || ' ' || o.last_name as owner_name
        FROM vehicle_ownership vo
        JOIN owners o ON vo.owner_id = o.owner_id
        WHERE vo.vehicle_id = ?
        ORDER BY vo.ownership_start_date DESC
      `, [vehicleId], (err, ownershipHistory) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json({ vehicle, insurance, ownership_history: ownershipHistory });
      });
    });
  });
});

// Create new vehicle
app.post('/api/vehicles', (req, res) => {
  const { vin, registration_number, make, model, year, color, engine_number, chassis_number, registration_date, owner_id } = req.body;
  const vehicle_id = uuidv4();

  db.run(`INSERT INTO vehicles (vehicle_id, vin, registration_number, make, model, year, color, engine_number, chassis_number, registration_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [vehicle_id, vin, registration_number, make, model, year, color, engine_number, chassis_number, registration_date],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });

      if (owner_id) {
        db.run(`INSERT INTO vehicle_ownership (vehicle_id, owner_id, ownership_start_date, is_current) VALUES (?, ?, DATE('now'), 1)`,
          [vehicle_id, owner_id]);
      }
      res.status(201).json({ message: 'Vehicle created', vehicle_id });
    });
});

// ==================== OWNER ROUTES ====================

// Register owner
app.post('/api/owners/register', async (req, res) => {
  const { first_name, last_name, email, phone, address, id_proof_type, id_proof_number, date_of_birth, password } = req.body;
  const owner_id = uuidv4();
  const password_hash = await bcrypt.hash(password, 10);

  db.run(`INSERT INTO owners (owner_id, first_name, last_name, email, phone, address, id_proof_type, id_proof_number, date_of_birth, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [owner_id, first_name, last_name, email, phone, address, id_proof_type, id_proof_number, date_of_birth, password_hash],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Email already registered' });
        return res.status(500).json({ error: err.message });
      }
      const token = jwt.sign({ owner_id, email }, JWT_SECRET, { expiresIn: '24h' });
      res.status(201).json({ message: 'Owner registered', owner_id, token });
    });
});

// Owner login
app.post('/api/owners/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM owners WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ owner_id: user.owner_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, owner: { owner_id: user.owner_id, first_name: user.first_name, last_name: user.last_name, email: user.email }});
  });
});

// Get all owners
app.get('/api/owners', (req, res) => {
  db.all('SELECT owner_id, first_name, last_name, email, phone, status, created_at FROM owners ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ owners: rows });
  });
});

// ==================== INSURANCE ROUTES ====================

// Add insurance
app.post('/api/insurance', (req, res) => {
  const { vehicle_id, policy_number, provider_name, insurance_type, coverage_amount, premium_amount, start_date, end_date } = req.body;
  const insurance_id = uuidv4();

  db.get('SELECT vehicle_id FROM vehicles WHERE vehicle_id = ?', [vehicle_id], (err, vehicle) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    db.run(`INSERT INTO insurance (insurance_id, vehicle_id, policy_number, provider_name, insurance_type, coverage_amount, premium_amount, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [insurance_id, vehicle_id, policy_number, provider_name, insurance_type, coverage_amount, premium_amount, start_date, end_date],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Insurance added', insurance_id });
      });
  });
});

// ==================== VERIFICATION ROUTES ====================

// Verify vehicle authorization for platform interaction
app.post('/api/verify/authorization', (req, res) => {
  const { vehicle_id, platform_id, action } = req.body;
  const timestamp = new Date().toISOString();

  db.get('SELECT * FROM vehicles WHERE vehicle_id = ? AND status = "active"', [vehicle_id], (err, vehicle) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!vehicle) {
      logAuth(vehicle_id, platform_id, action, 'denied', 'Vehicle not found/inactive');
      return res.status(403).json({ authorized: false, reason: 'Vehicle not found or inactive', timestamp });
    }

    db.get(`SELECT vo.*, o.status as owner_status FROM vehicle_ownership vo JOIN owners o ON vo.owner_id = o.owner_id 
      WHERE vo.vehicle_id = ? AND vo.is_current = 1`, [vehicle_id], (err, ownership) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!ownership) {
        logAuth(vehicle_id, platform_id, action, 'denied', 'No ownership record');
        return res.status(403).json({ authorized: false, reason: 'No valid ownership', timestamp });
      }
      if (ownership.owner_status !== 'active') {
        logAuth(vehicle_id, platform_id, action, 'denied', 'Owner inactive');
        return res.status(403).json({ authorized: false, reason: 'Owner account inactive', timestamp });
      }

      db.get(`SELECT * FROM insurance WHERE vehicle_id = ? AND status = 'active' AND start_date <= DATE('now') AND end_date >= DATE('now')`,
        [vehicle_id], (err, insurance) => {
          if (err) return res.status(500).json({ error: err.message });
          if (!insurance) {
            logAuth(vehicle_id, platform_id, action, 'denied', 'No active insurance');
            return res.status(403).json({ authorized: false, reason: 'No active insurance', timestamp });
          }

          logAuth(vehicle_id, platform_id, action, 'approved', 'All checks passed');
          res.json({ authorized: true, vehicle_id, owner_id: ownership.owner_id, insurance_id: insurance.insurance_id, platform_id, action, timestamp, validity: { vehicle: true, ownership: true, insurance: true }});
        });
    });
  });
});

function logAuth(vehicle_id, platform_id, action, status, details) {
  db.run(`INSERT INTO authorization_logs (vehicle_id, platform_id, action, status, details) VALUES (?, ?, ?, ?, ?)`,
    [vehicle_id, platform_id, action, status, details]);
}

// Get authorization logs
app.get('/api/logs/authorization', (req, res) => {
  db.all(`SELECT al.*, v.make, v.model FROM authorization_logs al LEFT JOIN vehicles v ON al.vehicle_id = v.vehicle_id ORDER BY al.timestamp DESC LIMIT 100`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logs: rows });
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as count FROM vehicles', [], (err, row) => {
    stats.total_vehicles = row.count;
    db.get('SELECT COUNT(*) as count FROM owners', [], (err, row) => {
      stats.total_owners = row.count;
      db.get('SELECT COUNT(*) as count FROM insurance WHERE status = "active"', [], (err, row) => {
        stats.active_insurances = row.count;
        db.get('SELECT COUNT(*) as count FROM authorization_logs WHERE status = "approved"', [], (err, row) => {
          stats.successful_authorizations = row.count;
          db.get('SELECT COUNT(*) as count FROM authorization_logs WHERE status = "denied"', [], (err, row) => {
            stats.denied_authorizations = row.count;
            res.json(stats);
          });
        });
      });
    });
  });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
});
