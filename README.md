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

## ⏰ Schedule Display Logic

The application uses intelligent logic to display sehri and iftar times based on the current time and user's location. Here's how it works across different pages:

### Core Server Actions

#### `getScheduleDisplayData(location?)`
Returns both today's and tomorrow's schedules along with time status flags:
```typescript
{
  today: TimeEntry | null,      // Today's schedule entry
  tomorrow: TimeEntry | null,   // Tomorrow's schedule entry
  sehriPassed: boolean,         // Whether today's sehri time has passed
  iftarPassed: boolean          // Whether today's iftar time has passed
}
```

**Logic:**
1. Fetches today's schedule based on current date (YYYY-MM-DD format)
2. Fetches tomorrow's schedule (date + 1 day)
3. Compares current time with sehri/iftar times to determine status
4. Returns formatted times in 12-hour format (e.g., "04:45 AM")

#### `getTodayOrNextDaySchedule(location?)`
Returns the appropriate schedule for display:
- Returns today's schedule if iftar time hasn't passed yet
- Returns tomorrow's schedule if today's iftar time has passed
- Returns `null` if no schedule is found

#### `getFullSchedule(location?)`
Returns all schedule entries, optionally filtered by location:
- Ordered by date ascending
- Returns formatted times in 12-hour format
- Used for calendar tables and location-specific pages

### Time Comparison Logic

#### `hasSehriPassed(schedule)` and `hasIftarPassed(schedule)`
These helper functions determine if a specific time has passed:

```typescript
// Parse time string (HH:mm format)
const [hours, minutes] = time.split(':').map(Number);

// Create date object with target time
const targetTime = new Date();
targetTime.setHours(hours, minutes, 0, 0);

// Compare with current time
return now >= targetTime;
```

**Note:** Time comparisons use the server's system time (Asia/Dhaka timezone).

### Page-Specific Display Logic

#### Home Page (`/`)
The home page displays the most relevant schedule based on current time:

1. **Fetches** both today's and tomorrow's schedules via [`getScheduleDisplayData()`](actions/time-entries.ts:99)
2. **Determines display schedule:**
   - If `iftarPassed` is `false`: Shows today's sehri and iftar
   - If `iftarPassed` is `true`: Shows tomorrow's sehri and iftar
3. **Visual indicators:**
   - Sehri card shows "Passed — fast has begun" if sehri time has passed
   - Sehri card shows "End time — fast begins" if sehri time is upcoming
   - Iftar card shows "Start time — fast breaks"
4. **Countdown timers:** Displayed only when within 1 hour of target time
5. **Passed schedule card:** Shows today's times in a separate card if iftar has passed

#### Calendar Page (`/calendar`)
The calendar page displays the full schedule in a table format:

1. **Main cards:** Uses [`getTodayOrNextDaySchedule()`](actions/time-entries.ts:64) to show today's or tomorrow's schedule
2. **Table rows:** Each row shows status based on time comparison:
   - **Passed** (red): Past dates or today after iftar time
   - **Today** (blue): Today before iftar time, or tomorrow after sehri time
   - **Tomorrow** (amber): Tomorrow before sehri time
   - **Upcoming** (default): Future dates beyond tomorrow
3. **Inline status logic** (lines 171-238 in [`app/(home)/calendar/page.tsx`](app/(home)/calendar/page.tsx:171)):
   ```typescript
   // Parse times
   const sehriTime = parseTime(entry.sehri);  // { hours, minutes }
   const iftarTime = parseTime(entry.iftar); // { hours, minutes }
   
   // Get current time
   const now = new Date();
   const currentHours = now.getHours();
   const currentMinutes = now.getMinutes();
   
   // Check if time has passed
   const isTimePast = (hours, minutes) => 
     currentHours > hours || (currentHours === hours && currentMinutes >= minutes);
   ```

#### Location Pages (`/location/[city]`)
Location-specific pages use the same logic as the calendar page but filtered by city:

1. **Validation:** Checks if the city exists in the database via [`getLocations()`](actions/time-entries.ts:191)
2. **Filtered data:** All queries include the location parameter
3. **Static generation:** Uses [`generateStaticParams()`](app/(home)/location/[city]/page.tsx:24) to pre-render all location pages
4. **Status logic:** Identical to calendar page (passed/today/tomorrow/upcoming)

### Countdown Timer Component

The [`CountdownTimer`](components/shared/countdown-timer.tsx:1) component provides real-time countdown:

**Features:**
- Only visible when within 1 hour of target time
- Updates every second
- Automatically handles next day if target time has passed
- Format: `HH:MM:SS` with pulsing clock icon

**Logic:**
```typescript
// Calculate time difference
const diff = targetDate.getTime() - now.getTime();
const oneHourMs = 60 * 60 * 1000;

// Show only if within 1 hour
if (diff <= oneHourMs && diff > 0) {
  // Display countdown
}
```

### Time Formatting

All times are stored in 24-hour format (HH:mm) in the database and converted to 12-hour format for display:

```typescript
// lib/utils.ts
export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
```

Example: `"04:45"` → `"4:45 AM"`, `"18:12"` → `"6:12 PM"`

### Location Filtering

Location filtering works consistently across all pages:

1. **Location parameter:** Passed via URL query param (`?location=Dhaka`) or route param (`/location/Dhaka`)
2. **Server action filtering:** All data fetching functions accept optional `location` parameter
3. **"All Locations":** When no location is specified, shows entries from all locations
4. **Location list:** Dynamically fetched from database via [`getLocations()`](actions/time-entries.ts:191)

### Data Flow Summary

```
User Request
    ↓
Server Component (page.tsx)
    ↓
Server Action (time-entries.ts)
    ↓
Prisma Query (MongoDB)
    ↓
Time Formatting & Status Calculation
    ↓
Client Component (countdown timer, UI)
    ↓
Display to User
```

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
