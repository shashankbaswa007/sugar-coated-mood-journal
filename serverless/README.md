# Serverless Proxy

This folder contains serverless proxy skeletons to forward requests to AI APIs.

## Files
- `geminiProxy.js` - Proxy for Gemini API
- `mockAllUsers.js` - Mock API for testing

## Important Security Note
- **Never commit your API keys**. Use environment variables (see `.env.example`).
- API keys should only be set on the server-side, never in the frontend.

## Gemini Proxy Setup

### 1. Get Your Gemini API Key
Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key.

### 2. Set Environment Variables
Create a `.env` file in the serverless directory:

```bash
# Required for Gemini functionality
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Grok Proxy
```bash
# Start the Grok proxy server (runs on port 3001 by default)
npm run start:grok-proxy
```

Or with environment variables inline:
```bash
GROK_API_URL=https://api.x.ai/v1/chat/completions GROK_API_KEY=your_key node serverless/grokProxy.js
```

### 4. Configure Frontend
In your `.env` file, set:
```bash
REACT_APP_USE_MOCK=false  # Enable real Grok calls
REACT_APP_USE_GROK=true   # Use Grok for suggestions
```

### 5. Test the Integration
1. Start the backend: `npm run start:grok-proxy`
2. In a separate terminal, start the frontend: `npm start`
3. Open http://localhost:3000
4. Create a journal entry and check the food suggestions
5. Click "Hit Me With Another One" to get new Grok-generated suggestions

## Features

### Rate Limiting
- 120 requests per 60 seconds per IP address
- Prevents API abuse

### Caching
- In-memory cache with 30-minute TTL
- Reduces API calls for identical requests

### Authentication (Optional)
If `GROK_PROXY_KEY` is set, clients must send it via the `x-grok-proxy-key` header.

## API Endpoints

### POST /api/grok/analyze
Analyzes mood and returns food suggestions.

**Request Body:**
```json
{
  "text": "Journal entry text",
  "mood": "happy"
}
```

**Response:**
```json
{
  "response": "Mood analysis text",
  "foodSuggestions": [
    {
      "name": "Gulab Jamun",
      "description": "Sweet syrupy dessert",
      "recipe": "Recipe instructions...",
      "orderLink": "https://www.swiggy.com/search?query=Gulab%20Jamun",
      "youtubeLink": "https://www.youtube.com/results?search_query=Gulab%20Jamun%20recipe"
    }
  ],
  "quote": "Inspirational quote",
  "poetry": "Mood-related poetry"
}
```

### POST /api/grok/monthly-summary
Generates a monthly summary from journal entries.

## Deployment

Deploy as a serverless function to your preferred platform:
- **Vercel**: Add environment variables in project settings
- **Netlify**: Configure environment variables in deploy settings
- **AWS Lambda**: Set environment variables in function configuration
- **Railway/Render**: Add environment variables in service settings

## Troubleshooting

### "Grok API not configured" Error
- Ensure `GROK_API_URL` and `GROK_API_KEY` are set
- Check that the proxy server is running

### "Rate limit exceeded" Error
- Wait 60 seconds or reduce request frequency
- Increase rate limit in `grokProxy.js` if needed

### Suggestions Not Updating
- Check browser console for errors
- Verify proxy is running on port 3001
- Check that frontend is calling `http://localhost:3001/api/grok/analyze`

### Cache Issues
- Restart the proxy server to clear cache
- Adjust `GROK_CACHE_TTL_MS` environment variable (default: 30 minutes)
