# 🌙 Ramadan Clock - Sehri & Iftar Time Viewer

A modern web application for viewing and managing Sehri & Iftar schedules during Ramadan. Built with Next.js 16, MongoDB, and shadcn/ui.

## ✨ Features

### Public Features
- **Today's Schedule**: View today's Sehri and Iftar times at a glance
- **Full Calendar**: Browse complete schedule in a table format
- **Location Filter**: Filter schedules by city/location
- **PDF Download**: Download schedules as PDF for offline use
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works seamlessly on all devices
- **SSR**: Server-side rendered pages for optimal SEO and performance

### Admin Features
- **Secure Login**: Password-protected admin dashboard
- **File Upload**: Upload schedules via JSON or CSV files
- **Drag & Drop**: Easy file upload with drag and drop support
- **Validation**: Real-time validation with error reporting
- **Preview**: Preview data before confirming upload
- **Sample Templates**: Download sample JSON/CSV templates
- **Dashboard**: View statistics and recent uploads

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (via Prisma ORM)
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Authentication**: NextAuth.js
- **File Parsing**: PapaParse (CSV), native JSON parser
- **PDF Generation**: jsPDF + jspdf-autotable
- **Validation**: Zod
- **Deployment**: Vercel-ready

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local or cloud)
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ramadan-clock
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="mongodb://localhost:27017/ramadan-clock"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="admin123"
   ```

4. **Generate Prisma client**
   ```bash
   pnpm db:generate
   ```

5. **Push schema to database**
   ```bash
   pnpm db:push
   ```

6. **Seed initial data (optional)**
   ```bash
   pnpm db:seed
   ```
   
   This creates:
   - Admin user (email: `admin@example.com`, password: `admin123`)
   - Sample time entries for testing

7. **Run the development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
ramadan-clock/
├── app/
│   ├── (home)/              # Public pages
│   │   ├── calendar/        # Full schedule calendar
│   │   └── location/        # Location-specific pages
│   ├── admin/               # Admin dashboard & upload
│   ├── api/                 # API routes (auth, PDF)
│   ├── auth/                # Login page
│   └── layout.tsx           # Root layout
├── actions/                 # Server actions
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── shared/              # Shared components (header, footer)
│   └── public/              # Public page components
├── lib/
│   ├── db.ts                # Prisma client singleton
│   ├── auth.ts              # Auth utilities
│   └── validations/         # Zod schemas
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
└── middleware.ts            # Auth middleware
```

## 📊 Database Schema

### TimeEntry
- `id`: ObjectId
- `date`: String (YYYY-MM-DD)
- `sehri`: String (HH:mm)
- `iftar`: String (HH:mm)
- `location`: String (nullable)
- Unique index on `(date, location)`

### AdminUser
- `id`: ObjectId
- `email`: String (unique)
- `password`: String (hashed)

### UploadLog
- `id`: ObjectId
- `fileName`: String
- `rowCount`: Int
- `status`: String (success/partial/failed)
- `errors`: String (JSON)

## 📤 File Upload Format

### JSON Format
```json
[
  {
    "date": "2026-03-01",
    "sehri": "04:45",
    "iftar": "18:12",
    "location": "Dhaka"
  }
]
```

### CSV Format
```csv
date,sehri,iftar,location
2026-03-01,04:45,18:12,Dhaka
```

### Validation Rules
- **Required fields**: date, sehri, iftar
- **Optional**: location
- **Date format**: YYYY-MM-DD
- **Time format**: HH:mm
- **Max rows**: 1000 per upload
- **File size**: Max 1MB
- **No duplicates**: (date + location) must be unique

## 🔐 Admin Access

Default admin credentials (change in production!):
- **Email**: `admin@example.com`
- **Password**: `admin123`

Access admin dashboard at: `/admin/dashboard`

## 🌐 Routes

### Public Routes
- `/` - Today's Sehri & Iftar
- `/calendar` - Full schedule calendar
- `/location/[city]` - Location-specific schedule

### Admin Routes (Protected)
- `/auth/login` - Admin login
- `/admin/dashboard` - Dashboard overview
- `/admin/upload` - Upload schedules

### API Routes
- `/api/auth/[...nextauth]` - Authentication
- `/api/pdf` - PDF generation

## 📱 Features Breakdown

### Home Page
- Real-time today's schedule display
- Location selector dropdown
- Quick links to location pages
- PDF download button
- Responsive card layout

### Calendar Page
- Full schedule table
- Today highlight badge
- Past/Upcoming status indicators
- Location filter
- Sortable columns

### Location Pages
- City-specific schedules
- Dynamic metadata for SEO
- Static generation for performance
- Back navigation

### Admin Dashboard
- Total entries count
- Number of locations
- Recent uploads table
- Status badges (Success/Partial/Failed)
- Quick upload button

### Upload System
- Drag & drop interface
- JSON and CSV support
- Real-time validation
- Error reporting by row
- Preview table (first 10 entries)
- Confirm dialog before upload
- Sample file downloads

### PDF Export
- Clean A4 layout
- Header with app title
- Date/location info
- Formatted table with all entries
- Page numbers
- Generation timestamp footer
- Custom filename

## 🎨 UI Components

Built with shadcn/ui:
- Card, Button, Table, Dialog
- Alert, Toast (Sonner), Tabs
- Select, Badge, Skeleton
- Dropdown Menu, Input, Label

## 🔒 Security

- Admin routes protected by NextAuth middleware
- Password hashing with bcryptjs
- Server-side validation
- File type restrictions
- File size limits
- Rate limiting ready (add middleware as needed)

## 🚀 Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL` (MongoDB Atlas recommended)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
4. Deploy

### Environment Variables for Production
```env
DATABASE_URL="mongodb+srv://<user>:<password>@cluster.mongodb.net/ramadan-clock"
NEXTAUTH_SECRET="<generate-secret>"
NEXTAUTH_URL="https://your-domain.com"
```

## 📝 Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed initial data
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built for the Muslim community during Ramadan
- Inspired by the need for accurate prayer time information
- Made with ❤️ using modern web technologies

---

**Ramadan Mubarak! 🌙**
