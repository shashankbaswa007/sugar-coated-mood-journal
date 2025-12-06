#!/bin/bash

# Test Gemini API Integration
# This script tests if the Gemini proxy can successfully generate food suggestions

echo "🧪 Testing Gemini API Integration..."
echo ""

# Check if proxy is running
if ! lsof -ti:4001 > /dev/null 2>&1; then
    echo "❌ Gemini proxy is not running on port 4001"
    echo "   Start it with: npm run start:gemini-proxy"
    exit 1
fi

echo "✅ Gemini proxy is running"
echo ""

# Test API endpoint
echo "📡 Testing /api/analyze endpoint..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:4001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I had a great day today! Everything went well.",
    "mood": "happy"
  }')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if response contains food suggestions
if echo "$RESPONSE" | jq -e '.foodSuggestions' > /dev/null 2>&1; then
    SUGGESTION_COUNT=$(echo "$RESPONSE" | jq '.foodSuggestions | length')
    echo "✅ Received $SUGGESTION_COUNT food suggestions"
    echo ""
    echo "Sample suggestion:"
    echo "$RESPONSE" | jq '.foodSuggestions[0]' 2>/dev/null
    echo ""
    echo "🎉 Gemini API integration is working!"
else
    echo "❌ No food suggestions in response"
    echo "   Check the Gemini API key in serverless/.env"
    exit 1
fi
