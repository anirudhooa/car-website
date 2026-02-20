# Apex Motors - Full Stack Luxury Car Showroom

A complete luxury car website with a Node.js backend, SQLite database, and admin panel.

## Features

### Frontend
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Black & Red Theme** - Premium luxury aesthetic with crimson accents
- **High-Quality Car Photos** - Beautiful car photography from Unsplash
- **Interactive Elements:**
  - Animated statistics counter
  - Image gallery with lightbox modal
  - Testimonial slider
  - Specifications tabs
  - Smooth scrolling navigation
  - Test drive booking modal

### Backend
- **REST API** - Complete API for all data operations
- **SQLite Database** - Persistent data storage
- **JWT Authentication** - Secure admin login
- **Rate Limiting** - API protection
- **Security Headers** - Helmet.js protection

### Admin Panel
- **Dashboard** - Overview with statistics
- **Contact Management** - View and manage customer inquiries
- **Test Drive Bookings** - Manage appointments with status updates
- **Car Inventory** - Add, edit, delete car listings
- **Gallery Management** - Manage gallery images
- **Export Functionality** - Export data to CSV

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)

### Installation

1. **Using the Launch Script (Windows)**:
   ```
   double-click launch.bat
   ```

2. **Manual Installation**:
   ```bash
   # Install dependencies
   npm install

   # Initialize database
   node setup-db.js

   # Start server
   npm start
   ```

3. **Development Mode (with auto-restart)**:
   ```bash
   npm run dev
   ```

### Access the Website

After starting the server:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Main Website |
| http://localhost:3000/admin | Admin Panel |

### Default Admin Login
- **Username**: `admin`
- **Password**: `admin123`

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/cars` | Get all cars |
| GET | `/api/cars/:id` | Get specific car |
| GET | `/api/testimonials` | Get testimonials |
| GET | `/api/gallery` | Get gallery images |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/test-drive` | Book test drive |

### Admin Endpoints (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/contacts` | Get all contacts |
| PATCH | `/api/admin/contacts/:id` | Update contact status |
| GET | `/api/admin/test-drives` | Get all bookings |
| PATCH | `/api/admin/test-drives/:id` | Update booking status |
| DELETE | `/api/admin/test-drives/:id` | Delete booking |
| POST | `/api/admin/cars` | Add new car |
| PATCH | `/api/admin/cars/:id` | Update car |
| DELETE | `/api/admin/cars/:id` | Delete car |

## Database Schema

### Tables
- **admins** - Admin user accounts
- **cars** - Vehicle inventory
- **contacts** - Customer contact form submissions
- **test_drives** - Test drive bookings
- **gallery** - Gallery images
- **testimonials** - Customer testimonials

## File Structure

```
car/
├── public/                 # Frontend files
│   ├── index.html         # Main website
│   ├── admin.html         # Admin panel
│   ├── styles.css         # Styling
│   ├── script.js          # Frontend JavaScript
│   └── uploads/           # Uploaded files
├── server.js              # Main server file
├── setup-db.js            # Database initialization
├── package.json           # Node dependencies
├── .env                   # Environment variables
├── launch.bat             # Windows launcher
└── README.md              # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-here
NODE_ENV=production
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the server |
| `npm run dev` | Start with auto-restart (development) |
| `npm run setup` | Initialize database |
| `npm run launch` | Setup and start server |

## Screenshots

### Website Sections
1. **Hero** - Full-screen landing with animated text
2. **Stats** - Performance statistics with animated counters
3. **Models** - Featured car models with pricing
4. **Gallery** - Interactive image gallery
5. **Specifications** - Tabbed specifications display
6. **Testimonials** - Customer testimonials slider
7. **Contact** - Contact form with test drive booking

### Admin Sections
1. **Overview** - Dashboard with statistics cards
2. **Contacts** - Manage customer inquiries
3. **Test Drives** - Manage booking appointments
4. **Cars** - Inventory management
5. **Gallery** - Image management

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Input validation
- SQL injection protection (parameterized queries)

## Technologies Used

### Backend
- Node.js
- Express.js
- SQLite3
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- multer (file uploads)
- helmet (security headers)
- express-rate-limit (rate limiting)
- morgan (logging)
- dotenv (environment variables)

### Frontend
- HTML5
- CSS3 (CSS Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Google Fonts

## Customization

### Adding New Cars
1. Login to admin panel
2. Navigate to "Cars" section
3. Click "Add Car" button
4. Fill in car details and save

Or via API:
```bash
curl -X POST http://localhost:3000/api/admin/cars \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Model",
    "price": 300000,
    "horsepower": 800,
    "acceleration": 3.0,
    "top_speed": 210,
    "image_url": "https://example.com/car.jpg"
  }'
```

### Changing Colors
Edit CSS variables in `public/styles.css`:
```css
:root {
    --primary-red: #e63946;    /* Main accent color */
    --dark-red: #c1121f;       /* Darker accent */
    --rich-black: #0a0a0a;     /* Background */
    /* ... */
}
```

## Troubleshooting

### Port Already in Use
Change the port in `.env`:
```env
PORT=8080
```

### Database Issues
Delete `database.sqlite` and run:
```bash
node setup-db.js
```

### Permission Errors (Linux/Mac)
```bash
chmod +x launch.bat
```

## License

MIT License - Feel free to use for personal or commercial projects.

## Support

For issues or questions:
- Check the console for error messages
- Review the server logs
- Ensure all dependencies are installed

---

**Created with ❤️ by Apex Motors**
