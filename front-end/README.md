# Invoicer Frontend

A modern React application for managing invoices, clients, and inventory items.

## Features

- **Dashboard**: Overview with statistics and recent invoices
- **Invoice Management**: Create, view, and manage invoices with status updates
- **Client Management**: Add, edit, and manage client information
- **Inventory Management**: Track items, quantities, and stock levels
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Automatic stock reduction when invoices are created

## Technology Stack

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Lucide React**: Beautiful icons
- **React Hot Toast**: Toast notifications
- **Date-fns**: Date formatting utilities

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
echo "REACT_APP_API_BASE_URL=http://localhost:5000" > .env
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## API Integration

The frontend connects to the following API endpoints:

### Invoices
- `POST /invoices/create` - Create new invoice
- `GET /invoices/list` - Get paginated invoice list
- `PUT /invoices/update-status/:id` - Update invoice status
- `GET /invoices/:id` - Get single invoice

### Clients
- `POST /clients/create` - Create new client
- `GET /clients/active` - Get active clients
- `PUT /clients/update/:id` - Update client
- `DELETE /clients/delete/:id` - Delete client
- `GET /clients/:id` - Get single client

### Items
- `POST /items/add` - Add new item
- `GET /items` - Get paginated item list
- `PUT /items/update/:id` - Update item
- `DELETE /items/delete/:id` - Delete item
- `PUT /items/mark-out-of-stock/:id` - Mark item as out of stock

## Project Structure

```
src/
├── components/     # Reusable components
├── context/       # React context for global state
├── pages/         # Page components
├── services/      # API service functions
├── App.js         # Main app component
└── index.js       # Entry point
```

## Key Features

### Dashboard
- Overview statistics (total invoices, clients, items, revenue)
- Quick action buttons
- Recent invoices list

### Invoice Management
- Create invoices with multiple items
- Real-time stock validation
- Automatic total calculation
- Status management (paid/unpaid)
- Pagination and filtering

### Client Management
- Add new clients with contact information
- Search and filter clients
- Soft delete functionality
- Responsive card layout

### Inventory Management
- Add items with pricing and quantities
- Stock level tracking
- Out-of-stock management
- Total value calculations

## Environment Variables

- `REACT_APP_API_BASE_URL`: Backend API base URL (default: http://localhost:5000)

## Docker

Build and run with Docker:

```bash
# Build the image
docker build -t invoicer-frontend .

# Run the container
docker run -p 3000:3000 invoicer-frontend
```

## Development

The application uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Hot reloading** for development
- **Error boundaries** for error handling
- **Loading states** for better UX
- **Toast notifications** for user feedback 