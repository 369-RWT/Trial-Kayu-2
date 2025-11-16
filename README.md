# Al Fath Kayu - Multi-Wood-Type Precision Costing System

A high-end minimalist web application for wood costing management, implementing META-FRAMEWORK V2 specifications with multi-wood-type segregation, weighted average costing, and comprehensive production tracking.

## 🌟 Features

### **Inventory Management**
- **Multi-Wood Type Tracking**: Separate inventory for Jati, Meranti, Mahoni, Sengon, Kamper
- **Automated Log Tag Generation**: Format `[WoodCode]-[SupplierCode]-[Date]-[Sequence]`
- **Kubikasi Calculation**: Automatic calculation using formula `(D² × L × 785) × N / 10000`
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
- **Charts**: Recharts
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 20+
- npm or yarn

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

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
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
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
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

## 🧮 Key Calculations

### Kubikasi Calculation

```
Diameter = Lingkar ÷ 4
Kubikasi Total = (Diameter² × Panjang × 785) × Jumlah Log / 10000
Kubikasi Final = FLOOR(Kubikasi Total)
```

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

## 🔒 Security Notes

- Input validation on all forms
- SQL injection prevention via Prisma
- Type safety with TypeScript
- Environment variables for sensitive data

## 📈 Performance Optimization

- Server-side rendering with Next.js
- Database indexing on frequently queried fields
- Efficient queries with Prisma
- Client-side form validation
- Optimistic UI updates

## 🚧 Roadmap

- [ ] Production batch execution workflow
- [ ] Waste recording interface
- [ ] Advanced reporting with date filters
- [ ] Excel export functionality
- [ ] User authentication & authorization
- [ ] Mobile responsive enhancements
- [ ] Real-time dashboard updates
- [ ] Audit log tracking

## 📄 License

Proprietary - Al Fath Kayu

## 👥 Support

For support and questions, contact the development team.

---

**Built with precision and minimalist design principles** 🌲
