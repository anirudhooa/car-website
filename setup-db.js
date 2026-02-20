// Database initialization script
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');

console.log('Initializing Apex Motors Database...\n');

const db = new sqlite3.Database(dbPath, async (err) => {
    if (err) {
        console.error('Error opening database:', err);
        process.exit(1);
    }
    console.log('✓ Database connected');

    try {
        // Create tables sequentially
        await createTables();
        console.log('✓ Tables created');

        // Insert default data
        await insertDefaultData();

        console.log('\n✓ Database initialization complete!');
        console.log('\n═══════════════════════════════════════════');
        console.log('  Default Admin Credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('═══════════════════════════════════════════\n');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.close();
    }
});

function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function createTables() {
    // Create tables sequentially to ensure completion

    // Contacts table
    await runQuery(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        model_interest TEXT,
        message TEXT,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Test drives table
    await runQuery(`CREATE TABLE IF NOT EXISTS test_drives (
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

    // Cars table
    await runQuery(`CREATE TABLE IF NOT EXISTS cars (
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

    // Admins table
    await runQuery(`CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Gallery table
    await runQuery(`CREATE TABLE IF NOT EXISTS gallery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        image_url TEXT NOT NULL,
        category TEXT,
        display_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Testimonials table
    await runQuery(`CREATE TABLE IF NOT EXISTS testimonials (
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
}

async function insertDefaultData() {
    // Check if admin exists
    const adminRow = await getQuery('SELECT COUNT(*) as count FROM admins WHERE username = ?', ['admin']);

    if (adminRow.count === 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await runQuery(
            'INSERT INTO admins (username, password, email, role) VALUES (?, ?, ?, ?)',
            ['admin', hashedPassword, 'admin@apexmotors.com', 'superadmin']
        );
        console.log('✓ Default admin created');
    }

    // Check if cars exist
    const carsRow = await getQuery('SELECT COUNT(*) as count FROM cars');

    if (carsRow.count === 0) {
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

        for (const car of defaultCars) {
            await runQuery(
                `INSERT INTO cars (name, tagline, description, price, horsepower, acceleration, top_speed, image_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [car.name, car.tagline, car.description, car.price, car.horsepower, car.acceleration, car.top_speed, car.image_url, car.featured]
            );
        }
        console.log('✓ Default cars added');
    }

    // Check if testimonials exist
    const testimonialsRow = await getQuery('SELECT COUNT(*) as count FROM testimonials');

    if (testimonialsRow.count === 0) {
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

        for (const t of defaultTestimonials) {
            await runQuery(
                `INSERT INTO testimonials (name, role, car_model, quote, image_url, rating) VALUES (?, ?, ?, ?, ?, ?)`,
                [t.name, t.role, t.car_model, t.quote, t.image_url, t.rating]
            );
        }
        console.log('✓ Default testimonials added');
    }
}
