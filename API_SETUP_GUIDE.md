# API Configuration Guide

## Current Setup: Mock Mode (Local Data)

The application is now using **mock mode** with local JSON data instead of external AI APIs.

### What Changed

✅ **Switched from Grok to Mock Mode**
- `REACT_APP_USE_MOCK=true` - Uses local food suggestions data
- `REACT_APP_USE_GROK=false` - Grok API disabled

### How It Works Now

1. **Food Suggestions**: Uses curated data from `src/data/foodSuggestions.json`
2. **Mood Responses**: Uses data from `src/data/moodResponses.json`
3. **Quotes & Poetry**: Uses data from `src/data/quotes.json` and `src/data/poetry.json`
4. **No API Calls**: Everything works offline with instant responses

### Starting the Application

```bash
# Just start the frontend (no backend proxy needed)
npm start
```

The app will now show food suggestions immediately from the local data files.

---

## Future: Switching to Gemini (When You Have Credits)

### Option 1: Use Gemini AI

1. **Get Gemini API Key**
   - Go to https://makersuite.google.com/app/apikey
   - Create a new API key

2. **Update `serverless/.env`**
   ```bash
   GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Update `.env`**
   ```bash
   REACT_APP_USE_MOCK=false
   REACT_APP_USE_GROK=false
   ```

4. **Create/Update Gemini Proxy**
   You'll need to update `serverless/geminiProxy.js` to properly integrate with Gemini's API

5. **Add script to package.json**
   ```json
   "start:gemini-proxy": "node serverless/geminiProxy.js"
   ```

6. **Start Both Services**
   ```bash
   # Terminal 1: Start Gemini proxy
   npm run start:gemini-proxy
   
   # Terminal 2: Start frontend
   npm start
   ```

---

## Future: Switching Back to Grok (When You Have Credits)

1. **Get new Grok API key** from https://console.x.ai/

2. **Update `serverless/.env`**
   ```bash
   GROK_API_URL=https://api.x.ai/v1/chat/completions
   GROK_API_KEY=your_new_grok_key_here
   ```

3. **Update `.env`**
   ```bash
   REACT_APP_USE_MOCK=false
   REACT_APP_USE_GROK=true
   ```

4. **Start Both Services**
   ```bash
   # Terminal 1: Start Grok proxy
   npm run start:grok-proxy
   
   # Terminal 2: Start frontend
   npm start
   ```

---

## Testing Current Setup

```bash
# Run tests
npm test

# Build production bundle
npm run build

# Start development server
npm start
```

Everything should work perfectly with local data! 🎉

---

## Benefits of Mock Mode

✅ **No API costs** - Free to use
✅ **Instant responses** - No network delays
✅ **Works offline** - No internet required
✅ **Predictable data** - Curated food suggestions
✅ **No rate limits** - Use as much as you want

## Limitations

⚠️ **Static suggestions** - Same suggestions for each mood
⚠️ **No personalization** - Can't adapt to journal entries
⚠️ **No variation** - "Hit me with another one" shuffles same pool

---

## Recommendation

**For now**: Keep using mock mode - it works great and is free!

**When ready**: Switch to Gemini (it has a free tier with generous limits)
