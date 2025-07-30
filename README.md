# Alma Lead Assessment - Next.js Application

A modern lead capture and management system built with Next.js, featuring dynamic form validation, admin dashboard, and PostgreSQL database integration.

## ⚡ Quick Start

1. **Clone and Install**:

   ```bash
   git clone <repository-url>
   cd alma-leads-nextjs
   npm install
   ```

2. **Start Database**: `docker-compose up -d`

3. **Setup Database**: `npx prisma migrate dev && npx prisma generate`

4. **Start Application**: `npm run dev`

5. **Access Routes**:
   - **Public Form**: http://localhost:3000/
   - **Admin Dashboard**: http://localhost:3000/admin (admin/password)

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

1. **Admin Login**: Navigate to `/admin` and enter credentials
2. **Cookie-based Session**: Persistent login session using HTTP-only cookies
3. **Route Protection**: Middleware automatically redirects unauthenticated users to login
4. **Session Management**: Logout functionality available in admin interface

## 🏗️ Tech Stack

- **Frontend**: Next.js 14.1.3 with React 18.2.0
- **Styling**: Tailwind CSS with custom components
- **Form Management**: JsonForms with custom renderers
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Cookie-based authentication for admin access
- **File Upload**: Native FormData handling
- **UI Components**: Custom-built with Tailwind CSS
- **Type Safety**: TypeScript throughout the application

## 📋 Key Features

### 1. Dynamic Lead Capture Form

- **JsonForms Integration**: Utilizes JsonForms for flexible, schema-driven form rendering
- **Progressive Validation**: Lenient validation during input, strict validation on submit
- **File Upload**: Resume upload functionality with proper file handling
- **Real-time Feedback**: Immediate validation feedback with custom error messaging
- **Loading States**: Professional loading indicators during form submission
- **Error Handling**: Comprehensive error handling for network and server issues

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
- **Session Management**: Persistent login sessions with proper logout

## 🎨 Design Decisions

### Form Architecture

**Choice**: JsonForms with Custom Renderers
**Rationale**:

- Provides schema-driven form generation for flexibility
- Allows custom UI components while maintaining validation logic
- Enables progressive validation (lenient → strict)
- Reduces boilerplate code for complex forms

### Validation Strategy

**Choice**: Dual Validation System
**Implementation**:

- **Lenient Schema**: Minimal validation during form interaction
- **Strict Schema**: Complete validation on submit attempt
- **Custom Validators**: Field-specific validation with user-friendly messages

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

1. **Admin Login**: Form-based login with username/password
2. **Cookie Setting**: HTTP-only cookie set on successful authentication
3. **Middleware Protection**: Next.js middleware validates cookies for protected routes
4. **API Protection**: Basic authentication for admin API endpoints

### Security Measures

- **Route Protection**: Middleware-based protection for `/admin` routes
- **API Security**: Separate authentication for API endpoints
- **Input Validation**: Comprehensive validation on both client and server
- **Error Handling**: Secure error messages without information leakage

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
│   │   │   └── route.ts         # Admin API endpoints
│   │   └── leads/
│   │       └── route.ts         # Lead submission API
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
│   └── db.ts                    # Database configuration
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── migrations/              # Database migrations
├── middleware.ts                # Route protection
└── docker-compose.yml           # PostgreSQL setup
```

## 🚦 Form Validation

### Validation Layers

1. **Schema Validation**: JsonForms schema-based validation
2. **Custom Validation**: Field-specific validation functions
3. **Real-time Feedback**: Immediate error display on user interaction
4. **Progressive Enhancement**: Lenient during input, strict on submit

### Validation Rules

- **Names**: Minimum 2 characters, letters/spaces/hyphens/apostrophes only
- **Email**: Standard email format validation
- **Country**: Required field
- **Website**: Optional but must be valid URL format if provided
- **Categories**: At least one visa category must be selected
- **Reason**: Minimum 10 characters explanation
- **Resume**: Optional file upload with proper file handling

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

# Set up database
npx prisma migrate dev
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
  - Login with credentials: `admin` / `password`
  - View and manage submitted leads
  - Test search, filtering, and editing features

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

- Set up proper environment variables
- Configure PostgreSQL for production
- Set up proper authentication secrets
- Configure file upload limits
- Set up monitoring and logging

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
