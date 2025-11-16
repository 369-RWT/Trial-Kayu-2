# Al Fath Kayu - Repository Structure & Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [API Endpoints](#api-endpoints)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [Testing](#testing)
7. [Deployment](#deployment)

---

## Project Overview

**Name**: Al Fath Kayu Multi-Wood-Type Precision Costing System
**Framework**: Next.js 14 (App Router)
**Database**: PostgreSQL 16
**ORM**: Prisma
**Authentication**: NextAuth.js
**Language**: TypeScript
**Styling**: Tailwind CSS

### Key Features
- Multi-wood-type inventory management
- Production batch planning and tracking
- Real-time WAC (Weighted Average Cost) calculation
- Comprehensive reporting (inventory valuation, production summary)
- Role-based access control (RBAC)
- Rate limiting and security headers

---

## Repository Structure

```
Trial-Kayu-2/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # NextAuth.js endpoints
│   │   ├── inventory/            # Inventory management APIs
│   │   ├── master/               # Master data CRUD APIs
│   │   │   ├── wood-types/       # Wood type management
│   │   │   ├── products/         # Product management
│   │   │   ├── suppliers/        # Supplier management
│   │   │   ├── workers/          # Worker management
│   │   │   └── machine-types/    # Machine type management
│   │   ├── production/           # Production management
│   │   │   └── batches/          # Production batch APIs
│   │   └── reports/              # Reporting endpoints
│   │       ├── inventory-valuation/
│   │       └── daily-production/
│   ├── auth/                     # Authentication UI
│   │   ├── signin/               # Sign-in page
│   │   ├── signout/              # Sign-out page
│   │   └── error/                # Auth error page
│   ├── inventory/                # Inventory pages
│   ├── production/               # Production pages
│   ├── reports/                  # Report pages
│   ├── master/                   # Master data pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Navigation.tsx            # Main navigation
│   ├── Providers.tsx             # Session provider
│   └── forms/                    # Form components
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client
│   ├── ratelimit.ts              # Rate limiting
│   └── utils.ts                  # Utility functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed script
│   └── migrations/               # Database migrations
├── tests/                        # Test suite
│   ├── integration/              # Integration tests
│   └── load/                     # Load tests
├── types/                        # TypeScript types
├── middleware.ts                 # Next.js middleware
├── docker-compose.yml            # PostgreSQL setup
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── tailwind.config.ts            # Tailwind config
```

---

## API Endpoints

### Authentication
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth.js endpoints | No |

### Inventory Management
| Endpoint | Method | Description | Auth Required | Roles |
|----------|--------|-------------|---------------|-------|
| `/api/inventory/logs` | GET | List log inventory | Yes | ALL |
| `/api/inventory/logs` | POST | Create log purchase | Yes | ADMIN, MANAGER, OPERATOR |

### Master Data
| Endpoint | Method | Description | Auth Required | Roles |
|----------|--------|-------------|---------------|-------|
| `/api/master/wood-types` | GET | List wood types | Yes | ALL |
| `/api/master/wood-types` | POST | Create wood type | Yes | ADMIN, MANAGER |
| `/api/master/wood-types/[id]` | GET | Get wood type | Yes | ALL |
| `/api/master/wood-types/[id]` | PATCH | Update wood type | Yes | ADMIN, MANAGER |
| `/api/master/wood-types/[id]` | DELETE | Delete wood type | Yes | ADMIN |
| `/api/master/products` | GET | List products | Yes | ALL |
| `/api/master/products` | POST | Create product | Yes | ADMIN, MANAGER |
| `/api/master/suppliers` | GET | List suppliers | Yes | ALL |
| `/api/master/suppliers` | POST | Create supplier | Yes | ADMIN, MANAGER |
| `/api/master/workers` | GET | List workers | Yes | ALL |
| `/api/master/workers` | POST | Create worker | Yes | ADMIN, MANAGER |
| `/api/master/machine-types` | GET | List machine types | Yes | ALL |
| `/api/master/machine-types` | POST | Create machine type | Yes | ADMIN, MANAGER |

### Production Management
| Endpoint | Method | Description | Auth Required | Roles |
|----------|--------|-------------|---------------|-------|
| `/api/production/batches` | GET | List production batches | Yes | ALL |
| `/api/production/batches` | POST | Create production batch | Yes | ADMIN, MANAGER, OPERATOR |

### Reports
| Endpoint | Method | Description | Auth Required | Roles |
|----------|--------|-------------|---------------|-------|
| `/api/reports/inventory-valuation` | GET | Inventory valuation report | Yes | ALL |
| `/api/reports/daily-production` | GET | Daily production summary | Yes | ALL |

### Rate Limiting
- **Authentication**: 3 requests/minute
- **Inventory**: 10 requests/10 seconds
- **Production**: 10 requests/10 seconds

---

## Database Schema

### Core Entities

#### Users & Authentication
- `User` - System users with roles (ADMIN, MANAGER, OPERATOR, VIEWER)
- `Session` - NextAuth.js sessions
- `AuditLog` - System audit trail

#### Master Data
- `WoodType` - Wood types (Jati, Meranti, Mahoni, etc.)
- `Supplier` - Supplier information
- `Product` - Product catalog
- `MachineType` - Machine types
- `Worker` - Worker profiles
- `ProductPricing` - Product × Wood Type pricing matrix

#### Inventory
- `LogInventory` - Log purchase records with WAC
- `InventoryValuation` - Daily inventory valuations

#### Production
- `ProductionBatch` - Production batch headers
- `BatchLineItem` - Production batch line items
- `LogConsumption` - Log consumption tracking
- `ProductionOutput` - Production output records
- `WasteDeviation` - Waste deviation tracking

#### Analytics
- `SupplierWoodPerformance` - Supplier performance by wood type

### Key Relationships
```
User 1 → N Session
User 1 → N AuditLog

WoodType 1 → N LogInventory
WoodType 1 → N InventoryValuation
WoodType 1 → N BatchLineItem

Supplier 1 → N LogInventory
Supplier 1 → N SupplierWoodPerformance

ProductionBatch 1 → N BatchLineItem
BatchLineItem 1 → N LogConsumption
BatchLineItem 1 → N ProductionOutput
BatchLineItem 1 → N WasteDeviation
```

---

## Authentication & Authorization

### Authentication Flow
1. User submits credentials to `/api/auth/[...nextauth]`
2. NextAuth.js validates credentials against database
3. Session created with user ID, email, name, and role
4. JWT token issued with session data
5. Middleware validates session on protected routes

### Role-Based Access Control (RBAC)

#### Roles Hierarchy
```
ADMIN       (Full access)
  ↓
MANAGER     (Management access)
  ↓
OPERATOR    (Operational access)
  ↓
VIEWER      (Read-only access)
```

#### Permissions Matrix

| Resource | ADMIN | MANAGER | OPERATOR | VIEWER |
|----------|-------|---------|----------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| View Inventory | ✅ | ✅ | ✅ | ✅ |
| Create Inventory | ✅ | ✅ | ✅ | ❌ |
| View Production | ✅ | ✅ | ✅ | ✅ |
| Create Production | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ✅ |
| Manage Master Data | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Delete Records | ✅ | ❌ | ❌ | ❌ |

### Security Features
- **Password Hashing**: bcryptjs with 12 rounds
- **Session Management**: NextAuth.js with JWT
- **Rate Limiting**: Upstash Redis with in-memory fallback
- **Security Headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- **HTTPS**: Required in production
- **CORS**: Configured for allowed origins

---

## Testing

### Test Structure

```
tests/
├── integration/                  # Integration tests
│   ├── production-batch.test.ts  # Production batch tests
│   └── reports.test.ts           # Reports tests
└── load/                         # Load tests
    ├── data-generator.ts         # Test data generator
    ├── api-load-test.ts          # API load tests
    ├── database-load-test.ts     # Database tests
    └── run-load-tests.ts         # Test runner
```

### Running Tests

```bash
# Integration tests (Vitest)
npm test

# Load tests
npm run test:load

# Watch mode
npm run test:watch

# UI mode
npm run test:ui
```

### Test Coverage

#### Integration Tests
- Production batch creation ✅
- WAC calculation ✅
- Inventory valuation reports ✅
- Daily production reports ✅
- Database transactions ✅

#### Load Test Results
- **API Performance**: A (EXCELLENT)
  - Throughput: 149.52 req/s
  - Response Time: 43.38 ms
- **Database Performance**: A (EXCELLENT)
  - Insert Rate: 127.39 rec/s
  - Concurrent Rate: 505.05 rec/s

---

## Deployment

### Prerequisites
- Node.js 18+ / 20+
- PostgreSQL 16
- npm or yarn

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Application
NEXT_PUBLIC_APP_NAME="Al Fath Kayu"
NEXT_PUBLIC_APP_DESCRIPTION="Multi-Wood-Type Precision Costing System"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# CORS
ALLOWED_ORIGINS="https://your-domain.com"

# Optional: Upstash Redis (for production rate limiting)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

### Deployment Steps

#### 1. Database Setup
```bash
# Create PostgreSQL database
createdb alfathkayu_db

# Create user and grant privileges
psql -c "CREATE USER alfathkayu WITH PASSWORD 'secure_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE alfathkayu_db TO alfathkayu;"
psql -c "ALTER USER alfathkayu CREATEDB;"
```

#### 2. Application Setup
```bash
# Clone repository
git clone <repository-url>
cd Trial-Kayu-2

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

#### 3. Build Application
```bash
# Build for production
npm run build

# Start production server
npm start
```

#### 4. Docker Deployment (Optional)
```bash
# Start PostgreSQL
docker-compose up -d

# Application will connect to localhost:5432
```

### Production Checklist

- [ ] Update `DATABASE_URL` with production credentials
- [ ] Change `NEXTAUTH_SECRET` to secure random value
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Configure CORS `ALLOWED_ORIGINS`
- [ ] Set up Upstash Redis for rate limiting (optional)
- [ ] Enable SSL/TLS for database connection
- [ ] Configure backup strategy
- [ ] Set up monitoring (APM, error tracking)
- [ ] Change default admin password after first login
- [ ] Review and update security headers
- [ ] Configure CDN for static assets (optional)
- [ ] Set up CI/CD pipeline
- [ ] Configure load balancer (if scaling)
- [ ] Set up database connection pooling

### Monitoring

Recommended monitoring setup:
- **Application Performance**: New Relic, Datadog, or Sentry
- **Database**: PostgreSQL logs, pg_stat_statements
- **Server**: CPU, Memory, Disk usage
- **Alerts**: Response time > 200ms, Error rate > 5%

### Backup Strategy

```bash
# Database backup (daily)
pg_dump alfathkayu_db > backup_$(date +%Y%m%d).sql

# Restore from backup
psql alfathkayu_db < backup_YYYYMMDD.sql
```

---

## Default User Credentials

**IMPORTANT**: Change these passwords immediately after first login!

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@alfathkayu.com | Admin123! |
| MANAGER | manager@alfathkayu.com | Manager123! |
| OPERATOR | operator@alfathkayu.com | Operator123! |
| VIEWER | viewer@alfathkayu.com | Viewer123! |

---

## Support & Maintenance

### Common Issues

**Issue**: Database connection failed
- **Solution**: Check `DATABASE_URL` format and credentials
- **Check**: PostgreSQL service is running

**Issue**: Migration failed
- **Solution**: Ensure user has CREATEDB privilege
- **Command**: `ALTER USER alfathkayu CREATEDB;`

**Issue**: Rate limit errors in development
- **Solution**: In-memory rate limiter is active (normal)
- **Note**: Configure Upstash Redis for production

### Logs

```bash
# View application logs
npm run dev  # Development mode with detailed logs

# PostgreSQL logs
tail -f /var/log/postgresql/postgresql-16-main.log
```

### Database Maintenance

```bash
# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('alfathkayu_db'));"

# Vacuum and analyze
psql -c "VACUUM ANALYZE;"

# Check connection count
psql -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## License

Proprietary - Al Fath Kayu

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
**Status**: Production Ready ✅
