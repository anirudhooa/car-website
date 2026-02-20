const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'apex-motors-secret-key-2026';

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "https://images.unsplash.com", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
db.serialize(() => {
  // Contact submissions table
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    model_interest TEXT,
    message TEXT,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Test drive bookings table
  db.run(`CREATE TABLE IF NOT EXISTS test_drives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    model TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Car models table
  db.run(`CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    price INTEGER,
    horsepower INTEGER,
    acceleration REAL,
    top_speed INTEGER,
    image_url TEXT,
    featured INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Gallery images table
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT NOT NULL,
    category TEXT,
    display_order INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Testimonials table
  db.run(`CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    car_model TEXT,
    quote TEXT NOT NULL,
    image_url TEXT,
    rating INTEGER DEFAULT 5,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default admin if not exists
  const defaultAdminExists = `SELECT COUNT(*) as count FROM admins WHERE username = 'admin'`;
  db.get(defaultAdminExists, [], async (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (row.count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(
        `INSERT INTO admins (username, password, email, role) VALUES (?, ?, ?, ?)`,
        ['admin', hashedPassword, 'admin@apexmotors.com', 'superadmin'],
        (err) => {
          if (err) {
            console.error('Error creating default admin:', err);
          } else {
            console.log('Default admin created: admin / admin123');
          }
        }
      );
    }
  });

  // Insert default cars if not exists
  const carsExist = `SELECT COUNT(*) as count FROM cars`;
  db.get(carsExist, [], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (row.count === 0) {
      const defaultCars = [
        {
          name: 'Phantom GT',
          tagline: 'The Grand Tourer',
          description: 'Experience unparalleled luxury and performance in our flagship grand tourer.',
          price: 285000,
          horsepower: 700,
          acceleration: 3.2,
          top_speed: 205,
          image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80',
          featured: 0
        },
        {
          name: 'Crimson X',
          tagline: 'The Ultimate Expression',
          description: 'Our most powerful creation. Pure adrenaline meets refined elegance.',
          price: 425000,
          horsepower: 847,
          acceleration: 2.8,
          top_speed: 217,
          image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
          featured: 1
        },
        {
          name: 'Shadow S',
          tagline: 'Stealth Performance',
          description: 'Silent power. Invisible presence. Absolute dominance.',
          price: 245000,
          horsepower: 650,
          acceleration: 3.5,
          top_speed: 198,
          image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
          featured: 0
        }
      ];

      const insertCar = db.prepare(`INSERT INTO cars (name, tagline, description, price, horsepower, acceleration, top_speed, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      defaultCars.forEach(car => {
        insertCar.run(car.name, car.tagline, car.description, car.price, car.horsepower, car.acceleration, car.top_speed, car.image_url, car.featured);
      });
      insertCar.finalize();
      console.log('Default cars inserted');
    }
  });

  // Insert default testimonials
  const testimonialsExist = `SELECT COUNT(*) as count FROM testimonials`;
  db.get(testimonialsExist, [], (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (row.count === 0) {
      const defaultTestimonials = [
        {
          name: 'Alexander Chen',
          role: 'Tech Entrepreneur',
          car_model: 'Crimson X',
          quote: 'The Crimson X isn\'t just a car, it\'s a statement. Every drive feels like an event.',
          image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
          rating: 5
        },
        {
          name: 'Marcus Sterling',
          role: 'Investment Banker',
          car_model: 'Phantom GT',
          quote: 'Unmatched performance with uncompromising luxury. Apex has redefined what a supercar can be.',
          image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
          rating: 5
        },
        {
          name: 'James Worthington',
          role: 'Professional Athlete',
          car_model: 'Shadow S',
          quote: 'The attention to detail is extraordinary. From the leather stitching to the exhaust note - perfection.',
          image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
          rating: 5
        }
      ];

      const insertTestimonial = db.prepare(`INSERT INTO testimonials (name, role, car_model, quote, image_url, rating) VALUES (?, ?, ?, ?, ?, ?)`);
      defaultTestimonials.forEach(t => {
        insertTestimonial.run(t.name, t.role, t.car_model, t.quote, t.image_url, t.rating);
      });
      insertTestimonial.finalize();
      console.log('Default testimonials inserted');
    }
  });
});

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all cars
app.get('/api/cars', (req, res) => {
  db.all('SELECT * FROM cars WHERE active = 1 ORDER BY featured DESC, name ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ cars: rows });
  });
});

// Get single car
app.get('/api/cars/:id', (req, res) => {
  db.get('SELECT * FROM cars WHERE id = ? AND active = 1', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ car: row });
  });
});

// Get featured car
app.get('/api/cars/featured/special', (req, res) => {
  db.get('SELECT * FROM cars WHERE featured = 1 AND active = 1 LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ car: row });
  });
});

// Get all testimonials
app.get('/api/testimonials', (req, res) => {
  db.all('SELECT * FROM testimonials WHERE active = 1 ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ testimonials: rows });
  });
});

// Get gallery images
app.get('/api/gallery', (req, res) => {
  db.all('SELECT * FROM gallery WHERE active = 1 ORDER BY display_order ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ images: rows });
  });
});

// Submit contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, model_interest, message } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const sql = `INSERT INTO contacts (name, email, phone, model_interest, message) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [name, email, phone || null, model_interest || null, message || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Contact submission received successfully',
      id: this.lastID
    });
  });
});

// Book test drive
app.post('/api/test-drive', (req, res) => {
  const { name, email, phone, model, preferred_date, preferred_time, notes } = req.body;

  if (!name || !email || !phone || !model || !preferred_date) {
    return res.status(400).json({ error: 'Required fields: name, email, phone, model, preferred_date' });
  }

  const sql = `INSERT INTO test_drives (name, email, phone, model, preferred_date, preferred_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, email, phone, model, preferred_date, preferred_time || null, notes || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: 'Test drive booked successfully',
      id: this.lastID,
      booking_reference: `APEX-TD-${this.lastID.toString().padStart(6, '0')}`
    });
  });
});

// ==================== ADMIN ROUTES ====================

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  });
});

// Get dashboard stats (protected)
app.get('/api/admin/stats', authenticateToken, (req, res) => {
  const stats = {};

  db.get('SELECT COUNT(*) as total FROM contacts', [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalContacts = row.total;

    db.get('SELECT COUNT(*) as total FROM test_drives', [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      stats.totalTestDrives = row.total;

      db.get('SELECT COUNT(*) as total FROM cars WHERE active = 1', [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalCars = row.total;

        db.get('SELECT COUNT(*) as new FROM contacts WHERE status = "new"', [], (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          stats.newContacts = row.new;

          db.get('SELECT COUNT(*) as pending FROM test_drives WHERE status = "pending"', [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.pendingTestDrives = row.pending;

            res.json(stats);
          });
        });
      });
    });
  });
});

// Get all contacts (protected)
app.get('/api/admin/contacts', authenticateToken, (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ contacts: rows });
  });
});

// Update contact status (protected)
app.patch('/api/admin/contacts/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE contacts SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Contact updated', changes: this.changes });
  });
});

// Get all test drives (protected)
app.get('/api/admin/test-drives', authenticateToken, (req, res) => {
  db.all('SELECT * FROM test_drives ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ testDrives: rows });
  });
});

// Update test drive status (protected)
app.patch('/api/admin/test-drives/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  db.run('UPDATE test_drives SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Test drive updated', changes: this.changes });
  });
});

// Delete test drive (protected)
app.delete('/api/admin/test-drives/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM test_drives WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Test drive deleted', changes: this.changes });
  });
});

// Add new car (protected)
app.post('/api/admin/cars', authenticateToken, (req, res) => {
  const { name, tagline, description, price, horsepower, acceleration, top_speed, image_url, featured } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  const sql = `INSERT INTO cars (name, tagline, description, price, horsepower, acceleration, top_speed, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, tagline, description, price, horsepower, acceleration, top_speed, image_url, featured || 0], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Car added successfully', id: this.lastID });
  });
});

// Update car (protected)
app.patch('/api/admin/cars/:id', authenticateToken, (req, res) => {
  const updates = req.body;
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);

  db.run(`UPDATE cars SET ${fields} WHERE id = ?`, [...values, req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Car updated', changes: this.changes });
  });
});

// Delete car (soft delete) (protected)
app.delete('/api/admin/cars/:id', authenticateToken, (req, res) => {
  db.run('UPDATE cars SET active = 0 WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Car deleted', changes: this.changes });
  });
});

// ==================== FRONTEND ROUTES ====================

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Catch all other routes and serve index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║     🏎️  APEX MOTORS - SERVER RUNNING  🏎️      ║
║                                                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  🌐 Website: http://localhost:${PORT}             ║
║  🔐 Admin:   http://localhost:${PORT}/admin       ║
║                                                ║
║  📧 Default Admin Login:                       ║
║     Username: admin                            ║
║     Password: admin123                         ║
║                                                ║
╚════════════════════════════════════════════════╝
  `);
});

module.exports = app;
