# AI Integration Setup Guide

## Overview
The AI-Powered Query feature integrates OpenAI's GPT-3.5-turbo model to provide intelligent insights about your invoice and client data using natural language queries.

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use the AI features
2. **Node.js**: Version 16 or higher
3. **MongoDB**: Running database instance

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### 2. Configure Environment Variables

Create a `.env` file in the `back-end` directory with the following variables:

```env
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

### 3. Install Dependencies

```bash
# In the back-end directory
npm install

# This will install the OpenAI SDK automatically
```

### 4. Start the Application

```bash
# Start the entire application with Docker
docker-compose up --build

# Or start backend separately
cd back-end
npm start
```

## Features Available

### 1. Natural Language Queries
Ask questions like:
- "Which clients show signs of churn risk?"
- "Who is most likely to buy our premium services?"
- "Identify clients with changing buying patterns"

### 2. Query Categories
- **Product Recommendations**: Find clients likely to buy specific products
- **Cross-sell/Up-sell**: Identify opportunities to sell more to existing clients
- **Churn Risk Analysis**: Detect clients at risk of leaving
- **Pattern Analysis**: Identify significant changes in client behavior

### 3. AI-Powered Insights
- Automatic data analysis
- Actionable recommendations
- Risk scoring and alerts
- Trend identification

## API Endpoints

### Main Query Endpoint
```
POST /ai/query
Body: { "query": "your natural language question" }
```

### Analytics Endpoints
```
GET /ai/analytics/summary
GET /ai/insights/dashboard
GET /ai/suggestions
GET /ai/analysis/churn-risk
GET /ai/analysis/pattern-changes
GET /ai/recommendations/client/:clientId
```

## Usage Examples

### Example Queries

1. **Churn Risk Analysis**:
   ```
   "Which clients show signs of churn risk based on declining invoice volume or delayed payments?"
   ```

2. **Product Recommendations**:
   ```
   "Given the purchase history of my clients, suggest who is the most likely to buy premium services"
   ```

3. **Cross-sell Opportunities**:
   ```
   "For each customer, based on their purchase history, suggest one or more products I can likely cross-sell or up-sell to them"
   ```

4. **Pattern Analysis**:
   ```
   "Identify clients whose buying patterns have changed significantly in the last 3 months"
   ```

### Frontend Usage

1. Navigate to the "AI Insights" page in the application
2. Type your question in natural language
3. Click "Ask AI" to get intelligent analysis
4. Review insights, recommendations, and actionable items

## Cost Considerations

- OpenAI API charges per token used
- GPT-3.5-turbo is cost-effective for this use case
- Typical queries cost $0.001-0.005 per request
- Monitor usage in your OpenAI dashboard

## Security Notes

- API key is stored securely in environment variables
- Never commit API keys to version control
- Data is sanitized before sending to OpenAI
- Queries are logged for monitoring

## Troubleshooting

### Common Issues

1. **"Failed to process query"**
   - Check if OpenAI API key is set correctly
   - Verify internet connection
   - Check OpenAI API status

2. **"Invalid API key"**
   - Ensure API key starts with `sk-`
   - Verify key is active in OpenAI dashboard
   - Check for extra spaces or characters

3. **"Rate limit exceeded"**
   - OpenAI has rate limits per minute/hour
   - Wait and try again
   - Consider upgrading OpenAI plan

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=ai:*
```

## Performance Optimization

- Queries are cached to reduce API calls
- Data is pre-processed for faster analysis
- Response times typically under 3 seconds
- Batch processing for multiple queries

## Future Enhancements

- Custom AI models for specific business logic
- Advanced analytics and predictions
- Integration with external data sources
- Automated insights and alerts 