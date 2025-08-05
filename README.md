# Invoicing Application

A comprehensive invoicing system with AI-powered insights, built with Node.js, React, MongoDB, and OpenAI integration.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- OpenAI API Key (for AI features)

### 1. Clone the Repository
```bash
git clone https://github.com/h3th-IV/invoicer-demo_app.git
cd invoicer-demo_app
```

### 2. Set Up Environment Variables

Create a `.env` file in the `back-end` directory:
```bash
# Database Configuration
MONGO_URI=mongodb://invoicer:password@localhost:27017/invoicing?authSource=admin

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Environment
NODE_ENV=development
PORT=5000
```

### 3. Get OpenAI API Key (Required for AI Features)

1. **Visit OpenAI Platform**: Go to [https://platform.openai.com/](https://platform.openai.com/)
2. **Sign Up/Login**: Create an account or log in
3. **Navigate to API Keys**: Click your profile → "API Keys" or visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
4. **Create New Key**: Click "Create new secret key" and give it a name
5. **Copy the Key**: The key starts with `sk-` (copy it immediately as you won't see it again)
6. **Add to .env**: Replace `sk-your-openai-api-key-here` with your actual key

**Note**: New users get free credits. Check usage at [https://platform.openai.com/usage](https://platform.openai.com/usage)

### 4. Run with Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 6. Initial Setup
1. Open http://localhost:3000 in your browser
2. Register a new staff account
3. Start creating clients, items, and invoices
4. Use AI Insights for intelligent data analysis

## Manual Setup (Alternative)

### Backend Setup
```bash
cd back-end
npm install
npm start
```

### Frontend Setup
```bash
cd front-end
npm install
npm start
```

### Database Setup
Ensure MongoDB is running on localhost:27017 with the credentials specified in the .env file.


## Features Completed

### Core Invoicing Features
- [X] **Invoice Creation Form** - Auto-generated numbers, validation, total calculation
- [X] **Invoice List View** - Table with sorting, pagination, filtering
- [X] **Invoice Status Management** - Mark as paid/unpaid with toggle
- [X] **Invoice Details** - Complete invoice information display

### Client Management
- [X] **Client CRUD Operations** - Create, Read, Update, Delete
- [X] **Client Search & Filtering** - Find clients quickly
- [X] **Client Analytics** - Purchase history and statistics
- [X] **Client Status Management** - Active/Inactive status

### Inventory Management
- [X] **Item CRUD Operations** - Complete inventory management
- [X] **Stock Tracking** - Automatic quantity updates
- [X] **Stock Validation** - Prevents overselling
- [X] **Item Performance Analytics** - Sales and revenue tracking

### Authentication & Security
- [X] **Staff Authentication** - Register, Login with JWT
- [X] **Role-based Access** - Staff vs Admin roles
- [X] **Protected Routes** - Secure API endpoints
- [X] **Session Management** - Persistent login state

### Dashboard & Analytics
- [X] **Comprehensive Dashboard** - Statistics and recent activity
- [X] **Overdue Detection** - Automatic highlighting of late invoices
- [X] **Revenue Analytics** - Total revenue and trends
- [X] **Real-time Updates** - Live data synchronization

### AI-Powered Insights 
- [X] **Natural Language Queries** - Ask questions in plain English
- [X] **Product Recommendations** - AI suggests likely buyers
- [X] **Churn Risk Analysis** - Identifies at-risk clients
- [X] **Pattern Analysis** - Detects significant changes
- [X] **Cross-sell Opportunities** - AI-powered recommendations
- [X] **Intelligent Insights** - Actionable business recommendations

### User Experience
- [X] **Responsive Design** - Works on desktop and mobile
- [X] **Modern UI** - Beautiful interface with Tailwind CSS
- [X] **Real-time Validation** - Form validation and error handling
- [X] **Loading States** - Smooth user experience
- [X] **Toast Notifications** - User feedback and alerts

## Features Not Completed
- PDF Export
- Email Notifications
- Multi-currency Support
- Advanced Reporting and Analytics
- Bulk Operations
- Client Portal
- Voice Queries
- Advanced AI Models

## Architecture & Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Validation**: Built-in validation with error handling
- **CORS**: Cross-origin resource sharing enabled

### Frontend
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.3.0
- **Styling**: Tailwind CSS 3.3.0
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker with docker-compose
- **Database**: MongoDB with persistent volumes
- **Environment**: Environment variable configuration
- **Security**: API key management and data sanitization

## Development & Deployment

### Development Commands
```bash
# Start with Docker (recommended)
docker-compose up --build

# Backend development
cd back-end
npm install
npm start

# Frontend development
cd front-end
npm install
npm start
```

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Or deploy to cloud platform
# (Instructions vary by platform)
```

## API Documentation

### Authentication Endpoints
- `POST /auth/staff/register` - Register new staff
- `POST /auth/staff/login` - Staff login
- `GET /auth/profile` - Get current user profile

### Invoice Endpoints
- `POST /invoices/create` - Create new invoice
- `GET /invoices/list` - Get paginated invoice list
- `PUT /invoices/update-status/:id` - Update invoice status
- `GET /invoices/:id` - Get single invoice

### Client Endpoints
- `POST /clients/create` - Create new client
- `GET /clients/active` - Get active clients
- `PUT /clients/update/:id` - Update client
- `DELETE /clients/delete/:id` - Delete client
- `GET /clients/:id` - Get single client

### Item Endpoints
- `POST /items/add` - Add new item
- `GET /items` - Get paginated item list
- `PUT /items/update/:id` - Update item
- `DELETE /items/delete/:id` - Delete item

### AI Endpoints
- `POST /ai/query` - Process natural language query
- `GET /ai/analytics/summary` - Get data summary
- `GET /ai/insights/dashboard` - Get insights dashboard
- `GET /ai/suggestions` - Get query suggestions

## AI Features Usage

### Example Queries
1. **Churn Risk**: "Which clients show signs of churn risk?"
2. **Product Recommendations**: "Who is most likely to buy premium services?"
3. **Cross-sell**: "Suggest products for cross-selling to existing clients"
4. **Pattern Analysis**: "Identify clients with changing buying patterns"

### AI Setup Requirements
- OpenAI API key (see setup instructions above)
- Internet connection for API calls
- Sufficient OpenAI credits

## Security Considerations

- API keys stored in environment variables
- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting on AI endpoints

## Troubleshooting

### Common Issues
1. **OpenAI API Errors**: Check API key and internet connection
2. **Database Connection**: Verify MongoDB is running
3. **Port Conflicts**: Ensure ports 3000, 5000, 27017 are available
4. **Docker Issues**: Check Docker and docker-compose installation

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm start
```

## Performance & Monitoring

- Response times typically under 3 seconds
- AI queries cached to reduce API calls
- Database queries optimized with indexing
- Real-time data synchronization
- Error logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.