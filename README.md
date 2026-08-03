# 🌙 Ramadan Clock

### A location-aware Sehri and Iftar companion for all 64 districts of Bangladesh

[![Support on SupportKori](https://img.shields.io/badge/Support_on-SupportKori-00B8B5)](https://www.supportkori.com/montasim)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1e645b86-edc8-45d2-96aa-a0927ba59c0d/deploy-status)](https://app.netlify.com/projects/fasttimes/deploys)
[![CI](https://github.com/montasim/ramadan-clock/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/ramadan-clock/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

Ramadan Clock helps people quickly find today's Sehri and Iftar times, check the complete Ramadan calendar, and download a district-specific schedule. It also provides administrators with a reliable workflow for fetching, validating, importing, and maintaining prayer-time data.

| | |
| --- | --- |
| **Status** | Active development / public preview |
| **Audience** | People in Bangladesh and schedule administrators |
| **Coverage** | 64 districts, `Asia/Dhaka` timezone |
| **Live demo** | [fasttimes.netlify.app](https://fasttimes.netlify.app) |
| **Repository** | [github.com/montasim/ramadan-clock](https://github.com/montasim/ramadan-clock) |
| **Funding** | [Support the project on SupportKori](https://www.supportkori.com/montasim) |

## Live demo

**[Open Ramadan Clock →](https://fasttimes.netlify.app)**

[![Ramadan Clock production preview](https://d33wubrfki0l68.cloudfront.net/6a6f0b6bcbe5ac0007640be5/screenshot_2026-08-02-09-24-05-0000.webp)](https://fasttimes.netlify.app)

## Contents

- [The problem](#the-problem)
- [The solution](#the-solution)
- [Key features](#key-features)
- [Using the application](#using-the-application)
- [How it works](#how-it-works)
- [Prayer-time data and accuracy](#prayer-time-data-and-accuracy)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Schedule import format](#schedule-import-format)
- [Main routes](#main-routes)
- [Project structure](#project-structure)
- [Useful commands](#useful-commands)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Support](#support)
- [Funding and sponsorship](#funding-and-sponsorship)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Data attribution](#data-attribution)
- [Author](#author)
- [License](#license)

## The problem

Ramadan schedules are often spread across posters, social posts, and manually prepared files. That creates a few recurring problems:

- People have to search repeatedly for the correct time for their district.
- Static images are difficult to filter, update, or use on small screens.
- Schedule maintainers need a safe way to import and validate many entries.
- Generating separate, printable calendars for multiple locations takes time.

## The solution

Ramadan Clock turns the schedule into a focused daily utility:

- See today's relevant fasting times at a glance.
- Automatically move to tomorrow's schedule after Iftar.
- Switch between available Bangladesh districts.
- Browse or download the complete district calendar.
- Import schedules from the Aladhan API, CSV, or JSON through a protected admin workflow.

## Key features

### For everyone

- Today's Sehri and Iftar times with real-time status
- Countdown during the final hour before a target time
- Complete Ramadan calendar with today and upcoming-day indicators
- Location filtering for all 64 districts of Bangladesh
- District-specific PDF export for printing or offline reference
- Responsive mobile layout, dark mode, loading states, and error boundaries
- Hadith display with source reference

### For schedule administrators

- Protected dashboard powered by NextAuth
- Aladhan API import by date range, Gregorian month, or Hijri month
- Multi-district fetching with progress reporting
- CSV and JSON upload with validation and preview
- Duplicate-safe database writes
- Configurable Ramadan date range
- Cache controls, upload history, and schedule management

### Engineering highlights

- Next.js App Router with server components and server actions
- PostgreSQL persistence through Prisma
- Feature-oriented schedule domain with repositories, services, and use cases
- Zod validation at application boundaries
- Token-bucket rate limiting and retry handling for external APIs
- Tagged caching and incremental revalidation
- Structured API responses, security headers, and request logging
- OpenAPI documentation for the public schedule API

## Using the application

### Check today's schedule

1. Open the home page.
2. Choose a district from the location selector.
3. Check the Sehri and Iftar cards for the relevant date.
4. Use the download action when a printable or offline copy is needed.

After Iftar, the application automatically presents the following day's schedule so the next Sehri time remains easy to find.

### Browse the Ramadan calendar

Open `/calendar`, select a district, and review the complete schedule. Rows identify the current and upcoming days, and the selected calendar can be exported as a PDF.

### Maintain schedule data

Administrators can sign in at `/auth/login` and then:

1. Configure the active Ramadan date range.
2. Fetch schedules from Aladhan or upload a CSV/JSON file.
3. Review validation results and preview the entries.
4. Confirm the import and manage the saved schedule from the dashboard.

Never deploy with example credentials, and keep administrator access protected by a strong secret and password.

## How it works

```mermaid
flowchart LR
    A[Aladhan API / CSV / JSON] --> B[Validation and preview]
    B --> C[Admin approval]
    C --> D[(PostgreSQL)]
    D --> E[Cached schedule services]
    E --> F[Today view]
    E --> G[Full calendar]
    E --> H[PDF and API]
```

Prayer times are stored in 24-hour `HH:mm` format. The public UI formats them for display and evaluates schedule status in the configured timezone. After today's Iftar has passed, the home experience selects tomorrow's schedule so the next Sehri is immediately available.

## Prayer-time data and accuracy

Ramadan Clock currently fetches calculated times from the [Aladhan API](https://aladhan.com/prayer-times-api) with the following configuration:

| Setting | Current value |
| --- | --- |
| Country | Bangladesh |
| Timezone | `Asia/Dhaka` |
| Calculation method | Method `2` — Islamic Society of North America (ISNA) |
| Sehri value | Fajr time returned by Aladhan |
| Iftar value | Maghrib time returned by Aladhan |
| Automatic adjustment | None (`0` minutes) |

Calculated times may differ from local mosque or religious-authority timetables because methods and local conventions vary. Users should follow their trusted local authority when schedules differ. A discrepancy report should include the district, date, expected time, comparison timetable, and calculation source.

## Technology

| Area | Technology |
| --- | --- |
| Web application | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Data | PostgreSQL, Prisma ORM |
| Authentication | NextAuth, bcryptjs |
| Validation | Zod |
| Prayer-time source | Aladhan API |
| PDF generation | jsPDF, jspdf-autotable |
| Time handling | Moment.js, Moment Timezone |
| Deployment | Netlify |

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- [pnpm](https://pnpm.io/)
- A PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/montasim/ramadan-clock.git
cd ramadan-clock
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure the environment

Copy the safe environment template:

```bash
cp .env.example .env.local
```

Then replace the placeholders in `.env.local`. The template documents the complete configuration contract:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ramadan_clock"
NEXTAUTH_SECRET="replace-with-a-random-secret-of-at-least-32-characters"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
TIMEZONE="Asia/Dhaka"
# RAMADAN_START_DATE="YYYY-MM-DD"
# RAMADAN_END_DATE="YYYY-MM-DD"
```

Generate a secure authentication secret with:

```bash
openssl rand -base64 32
```

Never commit `.env.local` or deploy with example credentials.

### 4. Prepare the database

```bash
pnpm db:generate
pnpm db:push
```

Optionally seed development data:

```bash
pnpm db:seed
```

### 5. Start the application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Schedule import format

Schedules can be imported as JSON or CSV. Dates use `YYYY-MM-DD`; times use 24-hour `HH:mm`.

### JSON

```json
[
  {
    "date": "YYYY-MM-DD",
    "sehri": "05:12",
    "iftar": "17:56",
    "location": "Dhaka"
  }
]
```

### CSV

```csv
date,sehri,iftar,location
YYYY-MM-DD,05:12,17:56,Dhaka
```

The importer checks file type, file size, field formats, row limits, and duplicate `(date, location)` combinations before writing to the database.

## Main routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Today's relevant Sehri and Iftar schedule | Public |
| `/calendar` | Complete Ramadan schedule | Public |
| `/contact` | Project and developer information | Public |
| `/auth/login` | Administrator sign-in | Public |
| `/admin/dashboard` | Schedule overview and management | Protected |
| `/admin/fetch` | Fetch prayer times from Aladhan | Protected |
| `/admin/import` | Import and preview schedule files | Protected |
| `/api/schedule` | Query schedule data | API |
| `/api/health` | Service health check | API |

See the [API usage guide](docs/api/usage-guide.md) and [OpenAPI specification](docs/api/openapi.yaml) for request and response details.

## Project structure

```text
ramadan-clock/
├── app/                    # Pages, API routes, and layouts
├── actions/                # Server actions
├── components/             # Public, admin, shared, and UI components
├── features/schedule/      # Domain, repositories, services, and use cases
├── hooks/                  # Client-side time and progress hooks
├── lib/                    # API, auth, cache, config, SEO, and utilities
├── prisma/                 # Database schema and seed script
├── docs/                   # API and implementation guides
└── public/                 # Web manifest and static assets
```

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Generate Prisma Client and create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript without emitting files |
| `pnpm test` | Run the automated test suite |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Synchronize the Prisma schema with the database |
| `pnpm db:seed` | Seed development data |
| `pnpm clean:all` | Clear generated application caches |

The GitHub Actions [CI workflow](.github/workflows/ci.yml) installs dependencies, generates Prisma Client, lints the repository, type-checks TypeScript, runs the automated tests, and creates a production build on pushes and pull requests.

## Deployment

The public preview is deployed on Netlify:

- Application: [fasttimes.netlify.app](https://fasttimes.netlify.app)
- Deployment status: [Netlify deploys](https://app.netlify.com/projects/fasttimes/deploys)

Configure the same variables listed in `.env.example` in the Netlify project environment. Set `NEXTAUTH_URL` and `ALLOWED_ORIGINS` to the production URL, then deploy from the `main` branch.

## Documentation

- [API usage guide](docs/api/usage-guide.md)
- [OpenAPI specification](docs/api/openapi.yaml)
- [Aladhan integration](docs/aladhan-api-implementation-summary.md)
- [Caching guide](docs/caching-implementation-guide.md)
- [Cache troubleshooting](docs/cache-troubleshooting-guide.md)
- [Rate-limiting guide](docs/rate-limiting-guide.md)
- [Contribution guide](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Support

- Use [GitHub Issues](https://github.com/montasim/ramadan-clock/issues) for reproducible bugs and feature requests.
- Include the affected route, district, date, expected result, and actual result in bug reports.
- Do not post credentials, database URLs, or other secrets in an issue.

Prayer-time discrepancies should include the trusted local timetable being compared and its calculation source when available.

Report vulnerabilities according to the [security policy](SECURITY.md), not through a public issue.

## Funding and sponsorship

Ramadan Clock is developed as a community-focused project. Financial support helps cover hosting and database costs, schedule verification, and continued improvements to the public experience.

[![Support Ramadan Clock on SupportKori](https://img.shields.io/badge/Support_Ramadan_Clock-SupportKori-00B8B5?style=for-the-badge)](https://www.supportkori.com/montasim)

Sponsorship is completely optional. Bug reports, code contributions, documentation improvements, and sharing the project are equally valuable ways to help.

## Roadmap

- [ ] Verify and clearly display calculation method, source, and schedule update time
- [ ] Persist the visitor's preferred district
- [ ] Add Bangla language support
- [ ] Add shareable district timetable images
- [ ] Complete offline/PWA support and reminders
- [ ] Expand automated coverage for API, timezone, and PDF behavior

## Contributing

Issues and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the local workflow, required checks, and guidance for reporting schedule discrepancies. Participation in the project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Data attribution

Prayer-time data is fetched from the [Aladhan API](https://aladhan.com/prayer-times-api). See [Prayer-time data and accuracy](#prayer-time-data-and-accuracy) for the active calculation configuration and limitations.

## Author

Built and maintained by [Montasim](https://github.com/montasim).

## License

Ramadan Clock is open-source software licensed under the [MIT License](LICENSE).

---

If this project is useful to you, consider starring the repository or sharing feedback through a GitHub issue.
