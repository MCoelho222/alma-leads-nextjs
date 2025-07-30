# Alma Lead Assessment - Next.js Application

A modern lead capture and management system built with Next.js, featuring dynamic form validation, enterprise-grade security, admin dashboard, and PostgreSQL database integration.

## ⚡ Quick Start

1. **Clone and Install**:

   ```bash
   git clone <repository-url>
   cd alma-leads-nextjs
   npm install
   ```

2. **Start Database**: `docker-compose up -d`

3. **Setup Database**: `npx prisma migrate deploy && npx prisma generate`

4. **Start Application**: `npm run dev`

5. **Access Routes**:
   - **Public Form**: http://localhost:3000/
   - **Admin Dashboard**: http://localhost:3000/admin (admin/password)
   - **Admin Login**: http://localhost:3000/login

## 🚀 Project Overview

This application serves as a comprehensive lead management system for immigration case assessments. It combines a user-facing form for lead submission with an administrative dashboard for lead management and status tracking.

## 🌐 Application Routes & Access

### Public Routes (No Authentication Required)

- **`/`** - **Lead Submission Form**
  - Main landing page with dynamic lead capture form
  - Visa category selection, file upload, and form validation
  - Redirects to `/thank-you` upon successful submission
- **`/thank-you`** - **Success Page**
  - Confirmation page after successful lead submission
  - Displays success message to users

### Authentication Routes

- **`/login`** - **Admin Login Page**
  - Authentication form for admin access
  - Redirects to admin dashboard upon successful login
  - Sets HTTP-only authentication cookies

### Protected Routes (Authentication Required)

- **`/admin`** - **Admin Dashboard**
  - Complete lead management interface
  - View, search, filter, and edit all submitted leads
  - Status management and lead information updates
  - Mobile-responsive design with pagination

### Admin Access Credentials

```
Username: admin
Password: password
```

**Note**: These are default credentials for demonstration purposes. In production, use secure, environment-specific credentials.

### Authentication Flow

1. **Admin Access**: Navigate to `/admin` → automatically redirects to `/login` if not authenticated
2. **Login Process**: Enter credentials (admin/password) on login page
3. **Cookie-based Session**: Persistent login session using HTTP-only cookies
4. **Route Protection**: Middleware automatically redirects unauthenticated users to login
5. **Session Management**: Logout functionality available via logout icon in admin interface

## 🏗️ Tech Stack

- **Frontend**: Next.js 14.1.3 with React 18.2.0
- **Styling**: Tailwind CSS with custom components
- **Form Management**: JsonForms with custom renderers
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Cookie-based authentication for admin access
- **File Upload**: Secure file handling with type/size validation
- **Security**: Multi-layer security with rate limiting and input validation
- **UI Components**: Custom-built with Tailwind CSS
- **Type Safety**: TypeScript throughout the application

## 📋 Key Features

### 1. Dynamic Lead Capture Form

- **JsonForms Integration**: Utilizes JsonForms for flexible, schema-driven form rendering
- **Progressive Validation**: Lenient validation during input, strict validation on submit
- **Secure File Upload**: Resume upload with type validation (PDF, DOC, DOCX, TXT) and 5MB size limit
- **Server-Side Validation**: Comprehensive input validation and sanitization on the backend
- **Rate Limiting**: DoS protection with 5 requests per 15 minutes per IP
- **Real-time Feedback**: Immediate validation feedback with custom error messaging
- **Loading States**: Professional loading indicators during form submission
- **Error Handling**: Comprehensive error handling for network and server issues
- **Security Headers**: XSS protection, clickjacking prevention, and content type validation

### 2. Admin Dashboard

- **Lead Management**: Complete CRUD operations for lead data
- **Lead Editing**: Click on any table row to open an edit modal with full lead information
- **Status Tracking**: Lead status management (Pending, Reached Out)
- **Search & Filter**: Real-time search with debounced input and status filtering
- **Pagination**: Client-side pagination for efficient data browsing
- **Responsive Design**: Mobile-first design with gradient sidebar
- **Data Export**: Easy access to lead information and contact details

### 3. Authentication System

- **Cookie-based Auth**: Secure authentication using HTTP-only cookies
- **Route Protection**: Middleware-based route protection for admin areas
- **API Security**: Basic authentication for admin API endpoints
- **Session Management**: Persistent login sessions with logout functionality

## 🎨 Design Decisions

### Form Architecture

**Choice**: JsonForms with Custom Renderers
**Rationale**:

- Provides schema-driven form generation for flexibility
- Allows custom UI components while maintaining validation logic
- Enables progressive validation (lenient → strict)
- Reduces boilerplate code for complex forms

### Validation Strategy

**Choice**: Triple-Layer Validation System
**Implementation**:

- **Client-side Lenient Schema**: Minimal validation during form interaction
- **Client-side Strict Schema**: Complete validation on submit attempt
- **Server-side Validation**: Comprehensive security validation with sanitization
- **Custom Validators**: Field-specific validation with user-friendly messages
- **Rate Limiting**: Request-level validation to prevent abuse

### State Management

**Choice**: React useState with Context
**Benefits**:

- Simple and lightweight for application scope
- ValidationContext for form-wide error state
- No over-engineering for current requirements

### Styling Approach

**Choice**: Tailwind CSS with Custom Components
**Advantages**:

- Rapid development with utility classes
- Consistent design system
- Custom components for reusable patterns
- Mobile-first responsive design

## 🗄️ Database Schema

### Lead Model

```sql
model Lead {
  id              Int        @id @default(autoincrement())
  firstName       String     -- User's first name
  lastName        String     -- User's last name
  email           String     -- Contact email
  country         String     -- Country of residence
  website         String     -- Personal/professional website
  categories      String[]   -- Selected visa categories (array)
  resume          Bytes?     -- Optional resume file (binary)
  reason          String     -- Explanation text
  status          LeadStatus @default(PENDING)
  createdAt       DateTime   @default(now())
}

enum LeadStatus {
  PENDING      -- New lead, not yet contacted
  REACHED_OUT  -- Lead has been contacted
}
```

### Database Decisions

- **PostgreSQL**: Chosen for robust array support (categories field)
- **Prisma ORM**: Type-safe database access with excellent TypeScript integration
- **File Storage**: Binary storage in database for simplicity (could be migrated to cloud storage)
- **Indexing**: Automatic indexing on id, timestamps for performance

## 🔐 Authentication & Security

### Authentication Flow

1. **Admin Login**: Form-based login with username/password at `/login`
2. **Cookie Setting**: HTTP-only cookie (`admin-auth`) set on successful authentication
3. **Middleware Protection**: Next.js middleware validates cookies for protected routes
4. **API Protection**: Basic authentication for admin API endpoints (logout endpoint excluded)
5. **Logout Process**: Logout endpoint clears authentication cookie without requiring basic auth

### Security Measures

- **Route Protection**: Middleware-based protection for `/admin` routes with automatic redirect to `/login`
- **API Security**: Basic authentication for admin API endpoints (except logout)
- **Public Route Security**: Comprehensive protection for lead submission endpoint
  - Server-side input validation and sanitization
  - File upload security (type, size, MIME validation)
  - Rate limiting (5 requests per 15 minutes per IP)
  - Secure error handling (no information leakage)
- **Security Headers**: XSS protection, clickjacking prevention, content type validation
- **Cookie Security**: HTTP-only cookies with secure and sameSite settings
- **Database Security**: Prisma ORM for SQL injection prevention, field length constraints
- **Input Validation**: Comprehensive validation on both client and server
- **Error Handling**: Generic client messages, detailed server-side logging

### 🛡️ Public Route Security (Lead Submission)

The lead submission endpoint `/api/leads` implements enterprise-grade security:

#### Input Validation & Sanitization

- **Server-side validation**: All inputs validated against strict schemas
- **Data sanitization**: Trimming, type checking, and format validation
- **Field constraints**: Length limits, character restrictions, required fields
- **Categories validation**: Only allowed visa categories accepted

#### File Upload Security

- **Type restrictions**: Only PDF, DOC, DOCX, TXT files allowed
- **Size limits**: Maximum 5MB file size
- **MIME type validation**: Prevents malicious file uploads
- **Safe processing**: Secure buffer handling

#### Rate Limiting & DoS Protection

- **Request limits**: 5 requests per 15 minutes per IP address
- **HTTP 429 responses**: Proper rate limit exceeded handling
- **Retry-After headers**: Client guidance for retry timing

#### Security Headers

- **XSS Protection**: `X-XSS-Protection: 1; mode=block`
- **Clickjacking Prevention**: `X-Frame-Options: DENY`
- **Content Type Validation**: `X-Content-Type-Options: nosniff`
- **Referrer Policy**: `strict-origin-when-cross-origin`
- **Permissions Policy**: Disabled camera, microphone, geolocation

#### Error Handling

- **Information hiding**: Generic error messages to clients
- **Detailed logging**: Server-side error logging for debugging
- **Status codes**: Proper HTTP status codes (400, 429, 500)

### 🔒 Attack Vector Protection

| Attack Type            | Protection Method                     | Status       |
| ---------------------- | ------------------------------------- | ------------ |
| SQL Injection          | Prisma ORM + Input validation         | ✅ Protected |
| XSS                    | Input sanitization + Security headers | ✅ Protected |
| File Upload Attacks    | Type/size/MIME validation             | ✅ Protected |
| DoS/Spam               | Rate limiting (5 req/15min)           | ✅ Protected |
| Information Disclosure | Generic error messages                | ✅ Protected |
| Clickjacking           | X-Frame-Options header                | ✅ Protected |
| MIME Sniffing          | X-Content-Type-Options header         | ✅ Protected |
| Data Overflow          | Field length constraints              | ✅ Protected |

## 📁 Project Structure

```
alma-leads-nextjs/
├── app/
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx             # Main admin interface
│   │   ├── SearchFilter.tsx     # Search component
│   │   └── StatusFilter.tsx     # Status filter component
│   ├── api/
│   │   ├── admin/
│   │   │   ├── route.ts         # Admin API endpoints
│   │   │   └── logout/
│   │   │       └── route.ts     # Logout API endpoint
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts     # Login API endpoint
│   │   └── leads/
│   │       └── route.ts         # Secure lead submission API with validation
│   ├── login/
│   │   └── page.tsx             # Admin login page
│   ├── thank-you/
│   │   └── page.tsx             # Success page
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main form page
├── lib/
│   ├── forms/                   # Form-related utilities
│   │   ├── customRenderers.tsx  # Custom JsonForms renderers
│   │   ├── FileUploadControl.tsx # File upload component
│   │   ├── layoutRenderers.tsx  # Layout renderers
│   │   ├── ValidationContext.tsx # Validation context
│   │   └── leadFormSchema*.ts   # Form schemas
│   ├── csrf.ts                  # CSRF protection utilities
│   └── db.ts                    # Database configuration
├── prisma/
│   ├── schema.prisma            # Database schema with security constraints
│   └── migrations/              # Database migrations
├── middleware.ts                # Route protection and security
└── next.config.js               # Next.js config with security headers
├── middleware.ts                # Route protection
└── docker-compose.yml           # PostgreSQL setup
```

## 🚦 Form Validation

### Validation Layers

1. **Client-side Schema Validation**: JsonForms schema-based validation
2. **Server-side Validation**: Comprehensive backend validation with sanitization
3. **Custom Validation**: Field-specific validation functions
4. **Security Validation**: Rate limiting, file type checking, input sanitization
5. **Real-time Feedback**: Immediate error display on user interaction
6. **Progressive Enhancement**: Lenient during input, strict on submit

### Validation Rules

#### Client-side Validation

- **Names**: Minimum 2 characters, maximum 50, letters/spaces/hyphens/apostrophes only
- **Email**: Standard email format validation, maximum 100 characters
- **Country**: Required field, 2-100 characters
- **Website**: Optional, maximum 200 characters, valid URL format if provided
- **Categories**: At least one visa category must be selected, validated against allowed list
- **Reason**: Minimum 10 characters, maximum 1000 characters explanation

#### Server-side Security Validation

- **Input Sanitization**: Trimming, type checking, format validation
- **File Upload Security**: PDF/DOC/DOCX/TXT only, 5MB maximum, MIME type validation
- **Rate Limiting**: 5 requests per 15 minutes per IP address
- **Data Constraints**: Database-level field length constraints
- **Category Validation**: Strict checking against predefined visa categories

### Security Features

- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and security headers
- **Error Information Protection**: Generic client messages, detailed server logging

## 🎯 Admin Dashboard Features

### Lead Management

- **View All Leads**: Paginated list with essential information
- **Edit Lead Details**: Click on any row to open a comprehensive edit modal
- **Search**: Real-time search across names and email (debounced)
- **Filter by Status**: Filter leads by PENDING/REACHED_OUT status
- **Status Updates**: Quick status change functionality
- **Contact Information**: Easy access to email and resume
- **Data Validation**: Full form validation in edit modal

### UI/UX Features

- **Gradient Sidebar**: Professional gradient design (light yellow to transparent)
- **Responsive Design**: Mobile-first with proper breakpoints
- **Loading States**: Loading indicators for all async operations
- **Error Handling**: User-friendly error messages
- **Pagination**: Simple arrow-based navigation with page numbers

## 🔧 Development Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd alma-leads-nextjs

# Install dependencies
npm install

# Start PostgreSQL database
docker-compose up -d

# Set up database (apply existing migrations)
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

### Accessing the Application

Once the development server is running, access the application at:

- **Public Lead Form**: `http://localhost:3000/`

  - Fill out the lead submission form
  - Test file upload functionality
  - Submit leads for testing

- **Admin Dashboard**: `http://localhost:3000/admin`
  - Automatically redirects to login page if not authenticated
  - Login with credentials: `admin` / `password`
  - View and manage submitted leads
  - Test search, filtering, and editing features
  - Use logout button to end session

### Environment Variables

```env
DATABASE_URL="postgresql://alma:alma123@localhost:5432/alma_leads"
```

## 🚀 Deployment

### Build Process

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Production Considerations

#### Database & Infrastructure

- Set up proper environment variables
- Configure PostgreSQL for production with SSL/TLS
- Run database migration: `npx prisma migrate deploy`

#### Security & Authentication

- Set up proper authentication secrets
- Configure HTTPS/SSL certificates
- Implement Redis-based rate limiting for horizontal scaling
- Set up DDoS protection (Cloudflare, AWS WAF)

#### File Upload & Storage

- Configure file upload limits (currently 5MB)
- Consider migrating to cloud storage (S3, CloudFlare R2)
- Set up virus scanning for uploaded files

#### Monitoring & Logging

- Set up security event logging
- Implement request monitoring and alerting
- Configure error tracking (Sentry, LogRocket)
- Set up performance monitoring

## 🧪 Testing Strategy

### Areas for Testing

- Form validation logic
- API endpoint functionality
- Authentication flow
- Database operations
- File upload handling
- Error scenarios

## 🔄 Future Enhancements

### Potential Improvements

1. **Cloud File Storage**: Migrate from database to S3/CloudFlare
2. **Advanced Authentication**: JWT tokens, role-based access
3. **Email Integration**: Automated email notifications
4. **Analytics**: Lead conversion tracking
5. **Advanced Filtering**: Date ranges, multiple criteria
6. **Bulk Operations**: Bulk status updates, exports
7. **Real-time Updates**: WebSocket integration for live updates

## 🐛 Known Limitations

1. **File Storage**: Files stored in database (not scalable for large files)
2. **Authentication**: Simple cookie-based auth (consider JWT for production)
3. **Search**: Basic text search (could implement full-text search)
4. **Real-time**: No real-time updates (requires manual refresh)

## 📝 Code Quality

### Implemented Practices

- **TypeScript**: Full type safety throughout the application
- **Component Reusability**: Modular component architecture
- **Error Boundaries**: Comprehensive error handling
- **Performance**: Debounced search, efficient pagination
- **Accessibility**: Semantic HTML, proper form labels
- **Code Organization**: Clear separation of concerns
- **Clean Dependencies**: Regular cleanup of unused packages

## 🤝 Contributing

1. Follow TypeScript best practices
2. Maintain component modularity
3. Write comprehensive validation
4. Test error scenarios
5. Update documentation for new features

---

_This project demonstrates modern React/Next.js development practices with a focus on user experience, data integrity, and maintainable code architecture._
