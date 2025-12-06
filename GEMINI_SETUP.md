# Gemini API Integration Setup

This guide explains how to use the Gemini API for generating AI-powered sweet food suggestions.

## How It Works

1. **Initial Suggestions**: When you submit a journal entry, the app immediately shows 3 hard-coded sweet food suggestions
2. **AI Enhancement**: In the background, the app calls Gemini API to get personalized suggestions based on your mood and journal entry
3. **Refresh Button**: When you click "Hit me with another one", the app calls Gemini API to generate fresh, unique AI-powered suggestions

## ✅ Current Status

The Gemini API integration is **FULLY WORKING** and ready to use!

- **Model**: gemini-2.5-flash (latest)
- **Endpoint**: https://generativelanguage.googleapis.com/v1beta
- **API Key**: Configured in `serverless/.env`

## Setup Instructions

### 1. Configure Gemini API Key

The Gemini API key is already configured in `serverless/.env`:

```env
GEMINI_API_KEY=AIzaSyBboUHKapo179ayHKUu20Wmj6FJ-MseH20
```

### 2. Enable Gemini Integration

Make sure `REACT_APP_USE_MOCK=false` in your `.env` file:

```env
REACT_APP_USE_MOCK=false
```

### 3. Start the Gemini Proxy Server

In one terminal, start the Gemini proxy:

```bash
npm run start:gemini-proxy
```

This will start the proxy server on port 4001.

### 4. Configure Proxy in package.json

Add this to your `package.json` (already configured):

```json
"proxy": "http://localhost:4001"
```

### 5. Start the React App

In another terminal, start the main app:

```bash
npm start
```

## Testing the Integration

1. Go to http://localhost:3000
2. Select a mood (e.g., Happy 😊)
3. Write a journal entry
4. Click "Let's See What The Sugar Gods Say"
5. You'll see 3 initial hard-coded suggestions immediately
6. Click "Hit Me With Another One 🔄" to get AI-generated suggestions from Gemini

## Troubleshooting

### "Could not refresh suggestions"

- Make sure the Gemini proxy is running (`npm run start:gemini-proxy`)
- Check that the API key is valid in `serverless/.env`
- Look at the console logs for detailed error messages

### "Gemini API not configured"

- Verify the `GEMINI_API_KEY` is set in `serverless/.env`
- Restart the proxy server after changing environment variables

### Still seeing hard-coded suggestions on refresh

- Confirm `REACT_APP_USE_MOCK=false` in `.env`
- Restart the React app after changing environment variables
- Check browser console for API call logs

## API Response Format

The Gemini API returns suggestions in this format:

```json
{
  "response": "Your motivational message",
  "foodSuggestions": [
    {
      "name": "Chocolate Lava Cake",
      "description": "Rich, gooey chocolate that matches your mood",
      "recipe": "Mix chocolate, butter, eggs, sugar. Bake at 375°F for 12 mins",
      "orderLink": "https://www.swiggy.com/search?query=chocolate+lava+cake",
      "youtubeLink": "https://www.youtube.com/results?search_query=chocolate+lava+cake+recipe"
    }
  ],
  "quote": "Life is short, eat dessert first!"
}
```

## Mock Mode vs API Mode

- **Mock Mode** (`REACT_APP_USE_MOCK=true`): Uses hard-coded suggestions from `src/data/foodSuggestions.json`
- **API Mode** (`REACT_APP_USE_MOCK=false`): Calls Gemini API for AI-generated suggestions

Mock mode is useful for development/testing without consuming API credits.
