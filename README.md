# Al Fath Kayu - Multi-Wood-Type Precision Costing System

A high-end minimalist web application for wood costing management, implementing META-FRAMEWORK V2 specifications with multi-wood-type segregation, weighted average costing, and comprehensive production tracking.

## 🌟 Features

### **Inventory Management**
- **Multi-Wood Type Tracking**: Separate inventory for Jati, Meranti, Mahoni, Sengon, Kamper
- **Automated Log Tag Generation**: Format `[WoodCode]-[SupplierCode]-[Date]-[Sequence]`
- **Kubikasi Calculation**: Automatic calculation using configurable formula `(D² × L × nilaiDasar) × N / 10000`
  - **nilaiDasar** is user-configurable (default: 785, range: 1-10,000)
- **Weighted Average Costing (WAC)**: Separate WAC calculation per wood type
- **FIFO Consumption**: Oldest logs consumed first with full traceability

### **Production Management**
- **Batch Planning**: Multi-line batches with wood type × product type combinations
- **Log Allocation**: Automatic FIFO allocation with WAC locking
- **Waste Tracking**: Wood type specific waste attribution
- **Supplier Quality Analysis**: Track waste rates by supplier and wood type
- **Cost Allocation**: Material costs with waste absorption

### **Reports & Analytics**
- **Daily Production Summary**: Output, waste, and efficiency by wood type
- **Inventory Valuation**: Current stock with WAC and aging analysis
- **Supplier Performance**: Quality scores and waste rate comparisons
- **Waste Analysis**: Breakdown by type, cause, and disposition
- **Cost Breakdown**: Detailed margin analysis per product × wood type

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Minimalist Design)
- **Database**: SQLite (dev) / PostgreSQL (production) with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Validation**: Zod schemas for input validation
- **Security**: Upstash Redis rate limiting (with in-memory fallback)
- **Password Hashing**: bcryptjs
- **Testing**: Vitest with 37+ comprehensive unit tests
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL (production) or SQLite (development)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 3. Configure Environment Variables

Create a `.env` file (see `.env.example` for reference):

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Rate Limiting (optional - falls back to in-memory)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Security
ALLOWED_ORIGINS="http://localhost:3000"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Tests

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Open test UI
npm run test:ui
```

## 📁 Project Structure

```
/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   └── inventory/
│   │       └── logs/             # Log purchase API
│   ├── inventory/                # Inventory management pages
│   │   ├── logs/                 # Log inventory & purchase
│   │   └── valuation/            # Inventory valuation reports
│   ├── production/               # Production management
│   │   ├── batches/              # Production batches
│   │   └── waste/                # Waste tracking
│   ├── reports/                  # Analytics & reports
│   └── master/                   # Master data management
├── components/                   # React components
│   ├── forms/                    # Form components
│   └── Navigation.tsx            # Main navigation
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth configuration & RBAC
│   ├── prisma.ts                 # Prisma client
│   ├── ratelimit.ts              # Rate limiting (Redis + fallback)
│   ├── utils.ts                  # Helper functions
│   └── validation.ts             # Zod validation schemas
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema (12+ models)
│   └── seed.ts                   # Seed data
├── tests/                        # Test suite
│   ├── calculations.test.ts      # Kubikasi, WAC, margin tests
│   ├── validation.test.ts        # Security & validation tests
│   └── calibration-dataset.ts    # Formula verification data
├── middleware.ts                 # Security middleware (auth, RBAC, CORS)
├── vitest.config.ts              # Test configuration
└── public/                       # Static assets
```

## 🗄️ Database Schema

### Core Entities

- **WoodType**: Wood types (Jati, Meranti, etc.)
- **Supplier**: Supplier master data
- **Product**: Product types (Horizontal Beams, etc.)
- **LogInventory**: Log purchase records with kubikasi
- **InventoryValuation**: Daily WAC calculation per wood type
- **ProductionBatch**: Production batch header
- **BatchLineItem**: Batch lines (wood type × product type)
- **LogConsumption**: FIFO log allocation tracking
- **WasteDeviation**: Waste tracking with attribution
- **ProductPricing**: Selling prices (product × wood type matrix)

### Security & Admin Entities

- **User**: User accounts with role-based permissions (ADMIN, MANAGER, OPERATOR, VIEWER)
- **Session**: NextAuth session management
- **AuditLog**: Comprehensive audit trail for all operations
- **SystemConfig**: System configuration and settings

## 🧮 Key Calculations

### Kubikasi Calculation

```
Diameter = Lingkar ÷ 4
Kubikasi Total = (Diameter² × Panjang × nilaiDasar) × Jumlah Log / 10000
Kubikasi Final = FLOOR(Kubikasi Total)
```

**Note**: `nilaiDasar` is a configurable constant (default: 785, range: 1-10,000) that can be adjusted per purchase. See `tests/calibration-dataset.ts` for formula verification data.

### Weighted Average Cost (Per Wood Type)

```
WAC = Total Inventory Value / Total Inventory Kubikasi
```

Updated after each purchase and consumption.

### Material Cost with Waste

```
Material Cost/m³ = (Direct Material + Net Waste Cost) ÷ Output Kubikasi
```

### Margin Calculation

```
Margin = Selling Price - (Material Cost + Labor + Electricity)
Margin % = (Margin / Selling Price) × 100
```

## 📊 Sample Data

The seed file includes:
- 5 wood types (Jati, Meranti, Mahoni, Sengon, Kamper)
- 3 suppliers
- 3 machine types
- 3 products
- 3 workers
- 15 pricing entries (product × wood type matrix)
- 5 sample log purchases
- Initial inventory valuations

## 🎨 Design Philosophy

**Minimalist & High-End**
- Clean typography with Inter font
- Ample whitespace for clarity
- Muted color palette (earth tones)
- Data-focused layouts
- Subtle animations
- Print-friendly reports

## 📝 Key Features by Module

### Inventory Module
- ✅ Log purchase recording with auto-calculation
- ✅ Log inventory listing with filters
- ✅ Weighted average cost tracking
- ✅ Inventory valuation reports
- ✅ Low stock alerts

### Production Module
- ⚙️ Production batch planning
- ⚙️ Multi-line item support
- ⚙️ FIFO log allocation
- ⚙️ Waste deviation tracking
- ⚙️ Output recording

### Reports Module
- 📈 Daily production summary
- 📈 Supplier performance analysis
- 📈 Waste analysis by wood type
- 📈 Cost breakdown reports
- 📈 Inventory aging

### Master Data Module
- 🔧 Wood type management
- 🔧 Supplier management
- 🔧 Product management
- 🔧 Pricing matrix
- 🔧 Worker & machine management

## 🔒 Security Features

### Input Validation (Phase 1.1-1.2)
- **Zod Schema Validation**: All API inputs validated with comprehensive Zod schemas
- **Type Safety**: Prevents SQL injection, integer overflow, NaN/Infinity injection
- **Range Validation**: Enforced min/max values on all numeric inputs
- **Server-side Recalculation**: Never trust client-calculated values

### Authentication & Authorization (Phase 1.3, 3.2)
- **NextAuth.js**: Secure session-based authentication
- **bcrypt Password Hashing**: Industry-standard password protection
- **Role-Based Access Control (RBAC)**: 4 roles (ADMIN, MANAGER, OPERATOR, VIEWER)
- **Protected Routes**: Middleware-enforced authentication on all API routes

### Rate Limiting (Phase 1.4)
- **Upstash Redis Integration**: Production-grade rate limiting
- **In-Memory Fallback**: Graceful degradation when Redis unavailable
- **10 requests per 10 seconds**: Default rate limit (configurable)

### Data Integrity (Phase 1.5-1.6)
- **Database Transactions**: ACID-compliant with Serializable isolation level
- **Race Condition Prevention**: Unique ID generation with nano ID
- **Retry Logic**: Automatic retry on unique constraint violations

### Security Headers (Phase 3.1, 3.4)
- **HTTPS Enforcement**: Production redirects to HTTPS
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **Content Security Policy (CSP)**: XSS prevention
- **CORS Configuration**: Restricted cross-origin requests

### Audit Logging (Phase 3.3)
- **Comprehensive Audit Trail**: All CREATE/UPDATE/DELETE operations logged
- **User Attribution**: Track who made what changes
- **IP & User Agent**: Security forensics capability
- **Compliance Ready**: SOX, GDPR, ISO 27001 compatible

### Testing & Quality Assurance
- **37+ Unit Tests**: Comprehensive test coverage with Vitest
- **Security Attack Vector Tests**: SQL injection, overflow, type confusion
- **Calculation Accuracy Tests**: Verify kubikasi, WAC, margin calculations
- **Formula Calibration Dataset**: Real-world verification data for domain experts

## 📈 Performance Optimization

- Server-side rendering with Next.js
- Database indexing on frequently queried fields
- Efficient queries with Prisma
- Client-side form validation
- Optimistic UI updates

## 🚧 Roadmap

### Security & Quality (Completed ✅)
- [x] User authentication & authorization (NextAuth.js + RBAC)
- [x] Audit log tracking (comprehensive audit trail)
- [x] Input validation & security hardening (Zod schemas)
- [x] Rate limiting (Upstash Redis + fallback)
- [x] Comprehensive unit testing (37+ tests)
- [x] Formula calibration dataset

### In Progress / Future Enhancements
- [ ] User registration & login UI
- [ ] Production batch execution workflow
- [ ] Waste recording interface
- [ ] Advanced reporting with date filters
- [ ] Excel export functionality
- [ ] Mobile responsive enhancements
- [ ] Real-time dashboard updates
- [ ] E2E testing with Playwright
- [ ] Load testing & performance benchmarks
- [ ] Domain expert formula verification

## 📄 License

Proprietary - Al Fath Kayu

## 👥 Support

For support and questions, contact the development team.

---

**Built with precision and minimalist design principles** 🌲
