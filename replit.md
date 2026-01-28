# Kibbeh House (كبة الدار) - Arabic Food Menu Application

## Overview

This is an Arabic-language food menu web application for "Kibbeh House" (كبة الدار), a restaurant specializing in Middle Eastern cuisine. The application features a customer-facing menu display with category filtering, a home page with hero section and featured products, and a secret admin panel for product management. The entire UI is designed with RTL (right-to-left) support for Arabic text.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom Arabic-optimized theme
- **UI Components**: shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and scroll effects
- **Typography**: Tajawal (sans-serif) and Aref Ruqaa (display/decorative) Arabic fonts

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful JSON API with typed routes defined in shared/routes.ts
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Validation**: Zod with drizzle-zod integration

### Data Storage
- **Database**: PostgreSQL (via DATABASE_URL environment variable)
- **Schema**: Two main tables - categories and products
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)

### Build System
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: esbuild bundles server, Vite builds client to dist/public
- **Path Aliases**: @/ for client/src, @shared/ for shared code

### Key Design Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository with path aliases for clean imports

2. **Shared Type Safety**: Schema definitions in shared/schema.ts used by both frontend and backend, ensuring type consistency

3. **API Contract**: Routes defined in shared/routes.ts with Zod schemas for request/response validation

4. **Price Storage**: Prices stored in smallest currency unit (cents/fils) as integers to avoid floating-point issues

5. **RTL-First Design**: Application built with Arabic RTL layout as the primary concern, using dir="rtl" and appropriate font choices

6. **Secret Admin Access**: Admin panel protected by a hidden button and PIN code (8890) rather than full authentication

## External Dependencies

### Database
- PostgreSQL database required via DATABASE_URL environment variable
- connect-pg-simple for session storage (available but may not be used yet)

### Image Hosting
- ImageKit integration configured in server/routes.ts for image uploads in admin panel
- Requires ImageKit credentials for product image management

### Third-Party Libraries
- Radix UI primitives for accessible component foundations
- Lucide React for iconography
- date-fns for date formatting
- embla-carousel-react for carousel functionality

### Development Tools
- Replit-specific Vite plugins for development (cartographer, dev-banner, error overlay)
- TypeScript for type checking across the entire codebase