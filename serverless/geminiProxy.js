/**
 * Gemini API proxy for generating sweet food suggestions based on mood
 * Handles authentication and formats requests/responses for the Gemini API
 */

const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

require('dotenv').config({ path: __dirname + '/.env' });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

app.post('/api/analyze', async (req, res) => {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured');
    return res.status(500).json({ error: 'Gemini API not configured' });
  }

  try {
    const { text, mood } = req.body;
    
    // Create a concise prompt for Gemini to generate sweet food suggestions
    const prompt = `You are a Gen-Z mood journal assistant. Generate sweet food suggestions based on:
Mood: ${mood}
Journal: ${text}

Return ONLY valid JSON (no markdown):
{
  "response": "Brief fun motivational message with emojis (max 2 sentences)",
  "foodSuggestions": [
    {
      "name": "Sweet name",
      "description": "Why it matches mood (1 sentence)",
      "recipe": "Brief recipe",
      "orderLink": "https://www.swiggy.com/search?query=FOODNAME",
      "youtubeLink": "https://www.youtube.com/results?search_query=FOODNAME+recipe"
    }
  ],
  "quote": "Short inspiring food quote"
}

Generate exactly 3 unique suggestions. Return ONLY the JSON.`;

    console.log('Calling Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return res.status(response.status).json({ error: 'Failed to generate suggestions' });
    }

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // Extract the generated text from Gemini's response
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('No text generated from Gemini');
      console.error('Full response:', JSON.stringify(data, null, 2));
      return res.status(500).json({ error: 'No response from AI' });
    }

    // Parse the JSON from the generated text
    // Remove markdown code blocks if present
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const parsedResponse = JSON.parse(jsonText);
    
    return res.json(parsedResponse);
  } catch (err) {
    console.error('Error in Gemini proxy:', err);
    return res.status(500).json({ error: 'Failed to generate suggestions', details: err.message });
  }
});

const PORT = process.env.PORT || 4001;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Gemini proxy running on port ${PORT}`);
  });
}

module.exports = app;
