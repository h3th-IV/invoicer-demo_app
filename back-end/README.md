# Invoicer Backend API

## Overview
This is the backend API for the Invoicer application, built with Node.js, Express.js, and MongoDB. The API provides comprehensive invoicing, client management, and inventory management functionality.

## Architecture

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Built-in validation with error handling
- **CORS**: Cross-origin resource sharing enabled

### Project Structure
```
back-end/
├── config/
│   └── db.js                 # Database connection configuration
├── controllers/
│   ├── authController.js     # Authentication endpoints
│   ├── clientController.js   # Client management endpoints
│   ├── invoiceController.js  # Invoice management endpoints
│   └── itemController.js     # Item/inventory endpoints
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   ├── client.js            # Client data model
│   ├── invoice.js           # Invoice data model
│   ├── item.js              # Item/inventory model
│   └── staff.js             # Staff user model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── clients.js           # Client management routes
│   ├── invoices.js          # Invoice management routes
│   └── items.js             # Item management routes
├── services/
│   ├── authService.js       # Authentication business logic
│   ├── clientService.js     # Client management business logic
│   ├── invoiceService.js    # Invoice business logic
│   └── itemService.js       # Item management business logic
├── utils/
│   └── response.js          # Standardized API response utilities
├── server.js                # Main application entry point
└── package.json             # Dependencies and scripts
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/staff/register` - Register new staff member
- `POST /auth/staff/login` - Staff login
- `GET /auth/profile` - Get current user profile (protected)

### Invoices (`/invoices`)
- `POST /invoices/create` - Create new invoice
- `GET /invoices/list` - Get paginated invoice list with filtering
- `PUT /invoices/update-status/:id` - Update invoice status (paid/unpaid)
- `GET /invoices/:id` - Get single invoice details

### Clients (`/clients`)
- `POST /clients/create` - Create new client
- `GET /clients/active` - Get paginated active clients list
- `PUT /clients/update/:id` - Update client information
- `DELETE /clients/delete/:id` - Mark client as inactive (soft delete)
- `GET /clients/:id` - Get single client details

### Items (`/items`)
- `POST /items/add` - Add new inventory item
- `GET /items` - Get paginated items list
- `GET /items/single/:id` - Get single item details
- `PUT /items/update/:id` - Update item information
- `DELETE /items/delete/:id` - Delete item
- `PUT /items/mark-out-of-stock/:id` - Mark item as out of stock

## Data Models

### Invoice Model
- `invoiceNumber` (String, unique) - Auto-generated invoice number
- `issueDate` (Date) - Invoice issue date
- `dueDate` (Date) - Payment due date
- `client` (ObjectId) - Reference to client
- `items` (Array of ObjectIds) - References to items
- `total` (Number) - Calculated total amount
- `status` (String) - 'paid' or 'unpaid'
- `timestamps` - Created and updated timestamps

### Client Model
- `name` (String, required) - Client full name
- `email` (String, unique) - Client email address
- `phone_number` (String) - Client phone number
- `address` (String) - Client address
- `billingAddress` (String) - Billing address
- `status` (String) - 'active' or 'inactive'
- `timestamps` - Created and updated timestamps

### Item Model
- `name` (String, required) - Item name
- `quantity` (Number, min: 1) - Available quantity
- `unitPrice` (Number, min: 0) - Price per unit
- `status` (String) - 'in-stock' or 'out-of-stock'
- `timestamps` - Created and updated timestamps

### Staff Model
- `email` (String, unique, required) - Staff email
- `password` (String, required) - Hashed password
- `name` (String, required) - Staff full name
- `role` (String) - 'admin' or 'staff'
- `status` (String) - 'active' or 'inactive'
- `timestamps` - Created and updated timestamps

## Key Features Implemented

### Authentication & Authorization
- JWT-based authentication with 24-hour token expiration
- Role-based access control (staff/admin)
- Password hashing with bcrypt
- Protected routes with middleware
- Automatic token validation

### Invoice Management
- Auto-generated invoice numbers (INV-timestamp format)
- Automatic total calculation based on item prices and quantities
- Stock validation and automatic deduction
- Overdue detection and highlighting
- Status management (paid/unpaid)
- Pagination and filtering support

### Client Management
- Complete CRUD operations
- Soft delete functionality (status-based)
- Search and pagination
- Contact information management
- Status tracking (active/inactive)

### Inventory Management
- Stock tracking with automatic updates
- Status management (in-stock/out-of-stock)
- Price and quantity management
- Stock validation during invoice creation
- Automatic status updates based on quantity

### Business Logic
- Service layer architecture for complex operations
- Comprehensive error handling
- Input validation and sanitization
- Database transaction safety
- Optimized queries with population

## Security Features
- JWT token authentication
- Password hashing with salt
- CORS configuration
- Input validation and sanitization
- Role-based access control
- Protected API endpoints

## Error Handling
- Standardized error responses
- Comprehensive error logging
- User-friendly error messages
- HTTP status code compliance
- Validation error handling

## Database Operations
- MongoDB with Mongoose ODM
- Optimized queries with indexing
- Population for related data
- Transaction safety
- Connection pooling

## Environment Configuration
- Environment variable support
- Development and production configurations
- Database connection management
- JWT secret configuration
- CORS origin configuration

## API Response Format
All API responses follow a standardized format:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": {
    // Response data
  }
}
```

## Running the Application
1. Install dependencies: `npm install`
2. Set up environment variables
3. Start the server: `npm start`
4. API will be available at `http://localhost:5000`

## Dependencies
- express: ^5.1.0
- mongoose: ^8.17.0
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- cors: ^2.8.5
- dotenv: ^17.2.1
- colors: ^1.4.0
- cookie-parser: ^1.4.7
- express-session: ^1.18.2
- passport: ^0.7.0
- csurf: ^1.11.0 