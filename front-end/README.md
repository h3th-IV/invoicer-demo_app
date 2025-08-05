# Invoicer Frontend Application

## Overview
This is the frontend application for the Invoicer system, built with React and Tailwind CSS. It provides a modern, responsive user interface for managing invoices, clients, and inventory.

## Architecture

### Tech Stack
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.3.0
- **Styling**: Tailwind CSS 3.3.0
- **HTTP Client**: Axios 1.4.0
- **Icons**: Lucide React 0.263.1
- **Notifications**: React Hot Toast 2.4.1
- **Date Handling**: date-fns 2.30.0
- **Build Tool**: Create React App 5.0.1

### Project Structure
```
front-end/
├── public/
│   └── index.html              # Main HTML template
├── src/
│   ├── components/
│   │   └── Layout.js           # Main layout component with sidebar
│   ├── context/
│   │   ├── AppContext.js       # Global application state
│   │   └── AuthContext.js      # Authentication state management
│   ├── pages/
│   │   ├── Dashboard.js        # Main dashboard with statistics
│   │   ├── Login.js            # Staff login page
│   │   ├── Register.js         # Staff registration page
│   │   ├── Invoices.js         # Invoice listing page
│   │   ├── CreateInvoice.js    # Invoice creation form
│   │   ├── SingleInvoice.js    # Single invoice details
│   │   ├── Clients.js          # Client listing page
│   │   ├── CreateClient.js     # Client creation form
│   │   ├── UpdateClient.js     # Client update form
│   │   ├── SingleClient.js     # Single client details
│   │   ├── Items.js            # Item listing page
│   │   ├── CreateItem.js       # Item creation form
│   │   ├── UpdateItem.js       # Item update form
│   │   └── SingleItem.js       # Single item details
│   ├── services/
│   │   └── api.js              # API service functions
│   ├── utils/
│   │   └── errorHandler.js     # Error handling utilities
│   ├── App.js                  # Main application component
│   ├── index.js                # Application entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind CSS configuration
└── postcss.config.js           # PostCSS configuration
```

## Features Implemented

### Authentication System
- **Staff Login**: Secure login with email and password
- **Staff Registration**: New staff member registration
- **JWT Token Management**: Automatic token handling and refresh
- **Protected Routes**: Role-based access control
- **Session Persistence**: Automatic login state restoration

### AI-Powered Insights 🧠
- **Natural Language Queries**: Ask questions in plain English
- **Query Suggestions**: Pre-built templates for common questions
- **Intelligent Analysis**: AI-powered insights and recommendations
- **Churn Risk Detection**: Identifies clients at risk of leaving
- **Product Recommendations**: Suggests likely buyers for products
- **Pattern Analysis**: Detects significant changes in client behavior
- **Cross-sell Opportunities**: AI-powered recommendations for upselling
- **Query History**: Tracks and displays recent queries

### Dashboard
- **Statistics Overview**: Total invoices, clients, items, and revenue
- **Recent Invoices**: Latest 5 invoices with overdue highlighting
- **Quick Actions**: Direct links to create invoices, clients, and items
- **Overdue Alerts**: Visual indicators for overdue invoices
- **Real-time Data**: Live statistics and recent activity

### Invoice Management
- **Invoice Creation**: 
  - Multi-step form with client and item selection
  - Real-time total calculation
  - Stock validation and availability checking
  - Auto-generated invoice numbers
- **Invoice Listing**: 
  - Paginated table with sorting
  - Status filtering (paid/unpaid)
  - Search functionality
  - Overdue detection and highlighting
- **Invoice Details**: 
  - Complete invoice information display
  - Client and item details
  - Status management (paid/unpaid toggle)
  - Overdue information

### Client Management
- **Client Creation**: Comprehensive client information form
- **Client Listing**: Paginated table with search and filtering
- **Client Details**: Complete client profile with statistics
- **Client Update**: Edit client information form
- **Client Deletion**: Soft delete with status management

### Inventory Management
- **Item Creation**: Add new inventory items with pricing
- **Item Listing**: Paginated table with stock status
- **Item Details**: Complete item information with usage statistics
- **Item Update**: Edit item information and pricing
- **Stock Management**: Mark items as out of stock
- **Stock Validation**: Prevent overselling during invoice creation

## User Interface Features

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Desktop Layout**: Full-featured desktop interface
- **Tablet Support**: Responsive breakpoints for tablets
- **Touch-Friendly**: Optimized for touch interactions

### Navigation
- **Sidebar Navigation**: Collapsible sidebar with active states
- **Breadcrumb Navigation**: Clear navigation hierarchy
- **Quick Actions**: Context-sensitive action buttons
- **Back Navigation**: Consistent back button behavior

### Data Display
- **Data Tables**: Sortable and filterable tables
- **Status Badges**: Color-coded status indicators
- **Loading States**: Skeleton loaders and spinners
- **Empty States**: Helpful messages for empty data
- **Error States**: User-friendly error messages

### Forms and Validation
- **Form Validation**: Real-time client-side validation
- **Error Handling**: Comprehensive error messages
- **Success Feedback**: Toast notifications for actions
- **Loading States**: Disabled states during operations
- **Auto-save**: Form data persistence

## Component Architecture

### Context Providers
- **AuthContext**: Manages authentication state and user data
- **AppContext**: Manages global application state (sidebar, etc.)

### Layout Components
- **Layout**: Main application layout with sidebar and header
- **ProtectedRoute**: Route protection with authentication checks
- **PublicRoute**: Public routes with authentication redirects

### Page Components
- **Dashboard**: Main dashboard with statistics and quick actions
- **Authentication Pages**: Login and registration forms
- **CRUD Pages**: Create, read, update, delete operations for all entities
- **Detail Pages**: Comprehensive information display

### Utility Components
- **Loading Spinner**: Reusable loading indicator
- **Status Badge**: Status indicator component
- **Action Button**: Consistent action button styling
- **Form Fields**: Reusable form input components

## State Management

### Authentication State
- User information and role
- Authentication status
- Token management
- Login/logout functions

### Application State
- Sidebar open/close state
- Global loading states
- Error states
- Navigation state

### Data State
- Entity lists with pagination
- Form data
- Search and filter states
- Loading and error states

## API Integration

### Service Layer
- **authAPI**: Authentication endpoints
- **invoiceAPI**: Invoice management endpoints
- **clientAPI**: Client management endpoints
- **itemAPI**: Item management endpoints
- **aiAPI**: AI-powered query and analytics endpoints

### Request/Response Handling
- **Axios Interceptors**: Automatic token injection
- **Error Handling**: Centralized error processing
- **Loading States**: Automatic loading state management
- **Response Formatting**: Consistent data formatting

## Styling and Design

### Tailwind CSS
- **Utility-First**: Rapid UI development
- **Custom Configuration**: Brand colors and spacing
- **Responsive Design**: Mobile-first responsive utilities
- **Component Classes**: Reusable component styles

### Design System
- **Color Palette**: Consistent brand colors
- **Typography**: Hierarchical text styles
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components

## Performance Optimizations

### Code Splitting
- **Route-based Splitting**: Automatic code splitting by routes
- **Lazy Loading**: Components loaded on demand
- **Bundle Optimization**: Optimized bundle sizes

### Data Management
- **Efficient Queries**: Optimized API calls
- **Caching**: Browser caching for static assets
- **Debouncing**: Search input debouncing
- **Pagination**: Efficient data loading

## Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Token Refresh**: Automatic token renewal
- **Logout Handling**: Secure logout with token cleanup
- **Route Protection**: Protected route components

### AI Integration
- **OpenAI API**: Secure integration with GPT-3.5-turbo
- **Query Processing**: Natural language to structured data
- **Error Handling**: Graceful handling of API failures
- **Rate Limiting**: Built-in protection against API abuse

### Data Validation
- **Client-side Validation**: Real-time form validation
- **Input Sanitization**: Safe input handling
- **Error Boundaries**: Graceful error handling
- **XSS Prevention**: Safe data rendering

## Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation

## 🧠 AI Features Usage

### Accessing AI Insights
1. Navigate to "AI Insights" in the sidebar
2. Type your question in natural language
3. Click "Ask AI" to get intelligent analysis
4. Review insights, recommendations, and actionable items

### Example Queries
- "Which clients show signs of churn risk?"
- "Who is most likely to buy our premium services?"
- "Suggest products for cross-selling to existing clients"
- "Identify clients with changing buying patterns"

### AI Setup Requirements
- OpenAI API key configured in backend
- Internet connection for API calls
- Sufficient OpenAI credits

## Development

#### Prerequisites
- Node.js 18 or higher
- Backend API running on `http://localhost:5000`
- OpenAI API key configured in backend (for AI features)

#### Quick Start with Docker
```bash
# From the root directory
docker-compose up --build
```

#### Manual Setup
1. Install dependencies: `npm install`
2. Start development server: `npm start`
3. Open browser to `http://localhost:3000`

#### Environment Variables
- `REACT_APP_API_BASE_URL`: Backend API URL (default: http://localhost:5000)

### Available Scripts
- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Environment Variables
- `REACT_APP_API_BASE_URL`: Backend API URL (default: http://localhost:5000)

## Dependencies
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.3.0
- axios: ^1.4.0
- lucide-react: ^0.263.1
- react-hot-toast: ^2.4.1
- date-fns: ^2.30.0
- tailwindcss: ^3.3.0
- autoprefixer: ^10.4.14
- postcss: ^8.4.24 