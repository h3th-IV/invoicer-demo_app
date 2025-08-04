import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const AIQuery = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [queryHistory, setQueryHistory] = useState([]);

  useEffect(() => {
    fetchQuerySuggestions();
  }, []);

  const fetchQuerySuggestions = async () => {
    try {
      const response = await aiAPI.getQuerySuggestions();
      setSuggestions(response.data.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    try {
      setLoading(true);
      const response = await aiAPI.query({ query: query.trim() });
      
      if (response.data.success) {
        setResult(response.data.data);
        setQueryHistory(prev => [{
          query: query.trim(),
          result: response.data.data,
          timestamp: new Date()
        }, ...prev.slice(0, 4)]); // Keep last 5 queries
        setQuery('');
        toast.success('Query processed successfully!');
      } else {
        toast.error('Failed to process query');
      }
    } catch (error) {
      handleApiError(error, toast, 'Failed to process query');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  const getQueryTypeIcon = (type) => {
    switch (type) {
      case 'product_recommendation':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'churn_risk':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'pattern_analysis':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'cross_sell_upsell':
        return <DollarSign className="h-5 w-5 text-yellow-500" />;
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h1>
          <p className="text-gray-600">
            Ask questions about your data using natural language
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Query Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Query Input */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ask a Question
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Which clients show signs of churn risk based on declining invoice volume?"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {query.length}/500 characters
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {loading ? 'Processing...' : 'Ask AI'}
                </button>
              </div>
            </form>
          </div>

          {/* Query Suggestions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Queries</h3>
            <div className="space-y-4">
              {suggestions.map((category, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-medium text-gray-900 mb-2">{category.category}</h4>
                  <div className="space-y-2">
                    {category.queries.map((suggestion, sIndex) => (
                      <button
                        key={sIndex}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 p-2 rounded transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Results */}
          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-4">
                {getQueryTypeIcon(result.analysis.type)}
                <h3 className="text-lg font-medium text-gray-900">Analysis Results</h3>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                <p className="text-gray-700">{result.analysis.summary}</p>
              </div>

              {/* Insights */}
              {result.analysis.insights && result.analysis.insights.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
                  <div className="space-y-3">
                    {result.analysis.insights.map((insight, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{insight.title}</h5>
                        <p className="text-gray-700 text-sm">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result.analysis.recommendations && result.analysis.recommendations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-3">
                    {result.analysis.recommendations.map((rec, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{rec.clientName}</h5>
                            <p className="text-gray-600 text-sm mb-2">{rec.reasoning}</p>
                            <p className="text-primary-600 text-sm font-medium">{rec.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>Processing time: {result.metadata.processing_time}</span>
                    <span>Data points analyzed: {result.metadata.data_points_analyzed}</span>
                  </div>
                  <span>Confidence: {Math.round(result.metadata.confidence_score * 100)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Queries</h3>
              <div className="space-y-3">
                {queryHistory.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {item.query.substring(0, 50)}...
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      {getQueryTypeIcon(item.result.analysis.type)}
                      <span className="text-xs text-gray-600 capitalize">
                        {item.result.analysis.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Analysis</h3>
            <div className="space-y-3">
              <button
                onClick={() => setQuery('Which clients show signs of churn risk based on declining invoice volume or delayed payments?')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Churn Risk Analysis</span>
                </div>
              </button>
              
              <button
                onClick={() => setQuery('For each customer, based on their purchase history, suggest one or more products I can likely cross-sell or up-sell to them')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Cross-sell Opportunities</span>
                </div>
              </button>
              
              <button
                onClick={() => setQuery('Identify clients whose buying patterns have changed significantly in the last 3 months')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Pattern Changes</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">💡 Tips for Better Results</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Be specific about what you want to analyze</li>
              <li>• Mention timeframes when relevant</li>
              <li>• Ask for actionable recommendations</li>
              <li>• Use natural language - no need for technical terms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuery; 